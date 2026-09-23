# Redis Cache-Aside в Go: практическое руководство по проекту online-store

## Вводное объяснение

Представим, что наш интернет-магазин становится популярнее. Пользователи часто открывают страницу товаров, и каждый такой запрос заставляет Go-приложение обращаться к PostgreSQL. База данных выполняет один и тот же `SELECT`, собирает один и тот же список и отправляет его приложению снова и снова.

PostgreSQL с этим справляется, пока запросов немного. Но с ростом нагрузки повторяющиеся чтения начинают занимать соединения, процессорное время и дисковые ресурсы базы. При этом список товаров обычно меняется гораздо реже, чем читается. Значит, нет необходимости получать его из PostgreSQL для каждого пользователя.

Мы хотим сохранить результат первого запроса в более быстром хранилище и использовать его повторно. Таким хранилищем будет Redis — отдельный сервис, который держит данные в памяти и позволяет быстро получать их по ключу.

Для списка товаров договоримся использовать ключ:

```text
products:all
```

Ключ можно воспринимать как имя ячейки. Внутри ячейки будет лежать JSON со списком товаров:

```text
products:all → [{"id":1,"name":"Keyboard","price":7990}, ...]
```

Redis ничего не знает о Go-структурах и таблицах PostgreSQL. Поэтому перед записью мы превращаем `[]domain.Product` в JSON, а после чтения превращаем JSON обратно в `[]domain.Product`.

Желаемый поток выглядит так. Пользователь запрашивает товары, сервис сначала спрашивает Redis: «Есть ли значение по ключу `products:all`?» Если значение есть и его удалось прочитать, сервис сразу возвращает товары. Это называется **cache hit**. PostgreSQL в таком запросе не участвует.

Если ключа нет, Redis сообщает об этом специальным результатом `redis.Nil`. Это **cache miss**. Тогда сервис обращается к PostgreSQL, получает актуальные товары, сохраняет их в Redis и возвращает пользователю. Таким образом, первый запрос заполняет кэш, а последующие используют готовый результат.

Эта схема называется **Cache-Aside**: приложение само управляет кэшем. Оно само проверяет Redis, само обращается к базе при отсутствии данных и само записывает результат в Redis.

PostgreSQL при этом остаётся источником истины. Redis — только ускоряющая копия. Если Redis временно недоступен, приложение по возможности должно продолжить работу через PostgreSQL. Потеря кэша ухудшает скорость, но не должна означать потерю основных данных.

Одной записи в Redis недостаточно. Нужно решить ещё две задачи.

Первая задача — срок жизни данных. Если ключ хранится бессрочно, он может устареть. Поэтому при записи устанавливается TTL: через заданное время Redis автоматически удалит ключ. Следующий запрос снова прочитает PostgreSQL и создаст свежий кэш.

Вторая задача — изменение товаров. Если администратор создал, обновил или удалил товар, ждать истечения TTL нежелательно: пользователи будут видеть старый список. Поэтому после успешного изменения PostgreSQL мы удаляем `products:all`. Это называется инвалидацией. Следующий GET получает cache miss, загружает свежий список и заново прогревает кэш.

Итоговая модель состоит из нескольких простых правил:

```text
Чтение:
Redis hit  → вернуть кэш
Redis miss → PostgreSQL → записать Redis → вернуть результат

Изменение:
PostgreSQL INSERT/UPDATE/DELETE → удалить ключ Redis

Страховка:
TTL автоматически удаляет ключ через заданное время
```

Для реализации нам понадобятся:

1. Запущенный Redis-контейнер.
2. Redis-клиент в Go-приложении.
3. Передача клиента в `ProductService`.
4. Единое правило формирования cache key.
5. JSON Marshal перед записью и Unmarshal после чтения.
6. Различение cache hit, cache miss и настоящей ошибки Redis.
7. TTL при выполнении `SET`.
8. `DEL` после успешных операций изменения товара.
9. Логи и команды проверки, чтобы наблюдать поведение системы.

Дальше документ разбирает каждый из этих пунктов по отдельности, а затем собирает их в полную реализацию.

Этот документ описывает реализованный в учебном проекте кэш списка товаров: подключение Redis, Cache-Aside, cache hit/cache miss, JSON-сериализацию, TTL, ленивый прогрев и инвалидацию после изменения данных.

Цель документа — позволить повторить реализацию с нуля и объяснить её на собеседовании.

## 1. Итоговая архитектура

Redis подключён к сервисному слою без отдельного декоратора:

```text
HTTP request
    ↓
ProductHandler
    ↓
ProductService
    ├── Redis
    └── ProductRepository
            ↓
        PostgreSQL
```

Handler отвечает за HTTP и JSON запроса/ответа. Repository отвечает за SQL. ProductService управляет Cache-Aside: сначала проверяет Redis, а при необходимости обращается к PostgreSQL.

Итоговый GET-поток:

```text
GET /products
→ Redis GET products:all
   ├── hit
   │   → JSON Unmarshal
   │   → вернуть []domain.Product
   │   → PostgreSQL не вызывается
   │
   ├── miss (redis.Nil)
   │   → PostgreSQL SELECT
   │   → JSON Marshal
   │   → Redis SET с TTL
   │   → вернуть []domain.Product
   │
   └── ошибка Redis
       → залогировать ошибку
       → PostgreSQL SELECT
       → вернуть []domain.Product
```

## 2. Чем PostgreSQL отличается от Redis

PostgreSQL хранит структурированные данные в таблицах. Схема создаётся миграциями:

```text
products
├── id
├── name
├── category_id
├── price
├── description
└── quantity
```

Redis не требует таблиц и миграций для кэш-ключей. Данные появляются при `SET`:

```text
products:all → JSON со списком товаров
```

Redis хранит последовательность байтов. Он не знает о типах Go (`struct`, `[]domain.Product`, `int`). В нашем случае байты представляют JSON.

Преобразования при записи и чтении:

```text
Запись:
[]domain.Product → json.Marshal → []byte с JSON → Redis SET

Чтение:
Redis GET → string с JSON → []byte → json.Unmarshal → []domain.Product
```

`go-redis.Result()` возвращает Go-строку, но метод сервиса должен вернуть `[]domain.Product`. Поэтому строку с JSON нельзя вернуть напрямую — нужен `json.Unmarshal`.

## 3. Docker-инфраструктура

Redis запускается отдельным контейнером. Backend обращается к нему по имени Docker Compose-сервиса `redis`, а не через `localhost`:

```yaml
services:
  backend:
    build:
      context: .
    ports:
      - 8090:8080
    environment:
      HTTP_ADDR: ":8080"
      DSN: postgres://shop_user:shop_password@postgres:5432/shop_db?sslmode=disable
      MIGRATIONS_PATH: file://migrations
      REDIS_ADDR: redis:6379
      REDIS_PASSWORD: ""
      REDIS_DB: "0"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  redis:
    image: redis
    ports:
      - 6379:6379
```

Проброс порта backend читается так:

```text
localhost:8090 → container:8080 → Go application:8080
```

Внутри Docker-сети backend использует `redis:6379`. Если backend запускается напрямую на компьютере через `go run`, адрес Redis должен быть `localhost:6379`.

Основные команды:

```powershell
cd C:\dev\online-store\backend

# Запустить всю инфраструктуру и пересобрать backend
docker compose up --build -d

# Пересобрать и запустить только backend с зависимостями
docker compose up --build -d backend

# Посмотреть состояние контейнеров проекта
docker compose ps

# Посмотреть логи backend
docker compose logs backend

# Следить за логами backend
docker compose logs -f backend

# Проверить Redis
docker compose exec redis redis-cli PING

# Остановить контейнеры проекта
docker compose down
```

Ожидаемый ответ Redis на `PING`:

```text
PONG
```

Если Docker пишет `port is already allocated`, порт занят другим процессом или контейнером. Найти Docker-контейнеры и их порты:

```powershell
docker ps
```

## 4. Go-зависимость и конфигурация

Используется официальный для экосистемы Go клиент `go-redis`:

```powershell
go get github.com/redis/go-redis/v9
```

Конфигурация содержит:

```go
type Config struct {
    RedisAddress  string
    RedisPassword string
    RedisDb       string
}
```

Значения читаются из окружения:

```go
RedisAddress:  os.Getenv("REDIS_ADDR"),
RedisPassword: os.Getenv("REDIS_PASSWORD"),
RedisDb:       os.Getenv("REDIS_DB"),
```

Функция создания клиента:

```go
func NewRedisClient(cfg config.Config) (*redis.Client, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    redisDB, err := strconv.Atoi(cfg.RedisDb)
    if err != nil {
        return nil, fmt.Errorf("invalid redis db: %w", err)
    }

    client := redis.NewClient(&redis.Options{
        Addr:     cfg.RedisAddress,
        Password: cfg.RedisPassword,
        DB:       redisDB,
    })

    if err := client.Ping(ctx).Err(); err != nil {
        return nil, fmt.Errorf("redis ping error: %w", err)
    }

    return client, nil
}
```

`redis.NewClient` создаёт клиент, а `PING` проверяет реальную доступность Redis во время запуска приложения.

## 5. Создание и закрытие клиента в main

После успешного создания клиента нужно зарегистрировать его закрытие:

```go
redisClient, err := database.NewRedisClient(*cfg)
if err != nil {
    return err
}
defer redisClient.Close()
```

`defer` должен находиться после проверки ошибки. Иначе при ошибке создания клиента переменная может быть `nil`, а отложенный `Close()` приведёт к панике.

То же правило действует для `*sql.DB`:

```go
db, err := database.NewDb(*cfg)
if err != nil {
    return err
}
defer db.Close()
```

`*sql.DB` — это пул соединений, а не одно соединение.

## 6. Передача Redis в сервис

Redis-клиент передаётся как зависимость `ProductService`:

```go
type ProductService struct {
    r     ProductRepository
    redis *redis.Client
}

func NewProductService(r ProductRepository, redisClient *redis.Client) *ProductService {
    return &ProductService{
        r:     r,
        redis: redisClient,
    }
}
```

Сборка зависимостей в `main`:

```go
productRepo := repository.NewProductRepo(db)
productService := service.NewProductService(productRepo, redisClient)
productHandler := handler.NewHandler(productService)
```

Redis не помещён в HTTP-handler, потому что handler должен заниматься HTTP, а решение «Redis или PostgreSQL» относится к получению данных в сервисе.

## 7. Формирование cache key

Для текущего запроса используется:

```text
products:all
```

Состав ключа:

```text
products → сущность
all      → полный список
```

Важно: текущий repository фактически возвращает все товары и не применяет `page` и `limit`, поэтому один ключ соответствует реальному SQL-запросу.

Когда появится настоящая пагинация или фильтры, их обязательно нужно включить в ключ:

```text
products:page:1:limit:20
products:category:2:page:1:limit:20
products:search:keyboard:page:1:limit:20
```

Разные результаты не должны использовать один ключ, иначе клиент получит данные от другого запроса.

## 8. Как различаются hit, miss и ошибка Redis

Результат `GET`:

```go
cachedData, err := s.redis.Get(ctx, "products:all").Result()
```

Имеет три состояния:

```text
err == nil
→ Redis доступен, ключ найден
→ cache hit

errors.Is(err, redis.Nil)
→ Redis доступен, но ключ отсутствует
→ cache miss

другая err
→ Redis не удалось проверить
→ timeout, connection refused, context canceled и т. п.
```

`redis.Nil` — не авария Redis. Это специальный результат библиотеки, означающий отсутствие ключа.

Нельзя считать любую ошибку cache miss. При инфраструктурной ошибке неизвестно, существует ли ключ.

## 9. Полная логика GET по Cache-Aside

Ниже итоговая логика метода. Названия констант вынесены для читаемости:

```go
const productsCacheKey = "products:all"
const productsCacheTTL = time.Minute

func (s *ProductService) GetProducts(
    ctx context.Context,
    page int,
    limit int,
) ([]domain.Product, error) {
    cacheMiss := false

    cachedData, err := s.redis.Get(ctx, productsCacheKey).Result()
    if err == nil {
        var cachedProducts []domain.Product

        decodeErr := json.Unmarshal([]byte(cachedData), &cachedProducts)
        if decodeErr != nil {
            log.Println("cache decode error:", decodeErr)
            cacheMiss = true
        } else {
            log.Println("cache hit")
            return cachedProducts, nil
        }
    } else if errors.Is(err, redis.Nil) {
        log.Println("cache miss")
        cacheMiss = true
    } else {
        log.Println("redis get error:", err)
    }

    products, err := s.r.GetProducts(ctx, page, limit)
    if err != nil {
        return []domain.Product{}, err
    }

    if cacheMiss {
        data, marshalErr := json.Marshal(products)
        if marshalErr != nil {
            log.Println("cache marshal error:", marshalErr)
        } else {
            setErr := s.redis.Set(
                ctx,
                productsCacheKey,
                data,
                productsCacheTTL,
            ).Err()
            if setErr != nil {
                log.Println("redis cache set error:", setErr)
            }
        }
    }

    return products, nil
}
```

Почему ошибки кэша не возвращаются клиенту: PostgreSQL является источником истины. Если данные из PostgreSQL успешно получены, сбой Redis не должен превращать успешный GET в HTTP 500.

В текущей реализации после инфраструктурной ошибки `GET` сервис читает PostgreSQL, но не пытается делать `SET`. Это осознанное простое поведение: если Redis только что был недоступен, дополнительная запись, скорее всего, тоже завершится ошибкой.

## 10. Важность порядка проверок

Ошибка PostgreSQL проверяется до сериализации и записи в Redis:

```text
PostgreSQL SELECT
→ проверить err
→ только после успеха выполнять Marshal и SET
```

Иначе при ошибке базы можно случайно записать в кэш `null` или пустой результат.

После ошибки `json.Marshal` нельзя выполнять `SET`: полученное значение не считается корректным JSON.

Ошибку `SET` нужно получить через `.Err()`:

```go
setErr := s.redis.Set(ctx, key, data, ttl).Err()
```

Распространённая ошибка — проверить `setErr`, но вывести в лог старую переменную `err`. Компилятор этого не заметит, потому что обе переменные имеют подходящий тип.

## 11. Повреждённое значение в Redis

Наличие ключа ещё не гарантирует, что его значение пригодно для приложения. JSON может быть повреждён или иметь старый формат.

Используемое поведение:

```text
Redis GET успешно
→ Unmarshal завершился ошибкой
→ не возвращать повреждённые данные
→ прочитать PostgreSQL
→ перезаписать ключ корректным JSON
```

Ранний `return` разрешён только после успешного `Unmarshal`.

## 12. TTL

TTL (Time To Live) — срок жизни ключа.

Запись с TTL:

```go
s.redis.Set(ctx, "products:all", data, time.Minute)
```

Аргумент `0` означал бы отсутствие срока жизни — ключ хранился бы до явного `DEL`.

Текущий фиксированный TTL:

```text
ключ создан в 12:00:00
TTL = 1 минута
ключ истечёт примерно в 12:01:00
```

Чтение ключа не продлевает TTL. Это не sliding expiration.

После истечения TTL:

```text
Redis удаляет ключ
→ следующий GET получает redis.Nil
→ PostgreSQL
→ ключ создаётся заново с новым TTL
```

Команды проверки:

```powershell
# TTL в секундах
docker compose exec redis redis-cli TTL products:all

# TTL в миллисекундах
docker compose exec redis redis-cli PTTL products:all
```

Специальные ответы:

```text
-1 → ключ существует, но TTL не установлен
-2 → ключ не существует
```

После добавления TTL старый ключ, созданный ранее без TTL, нужно удалить или перезаписать. Изменение Go-кода не меняет срок жизни уже существующего ключа.

## 13. Ленивый прогрев кэша

В проекте реализован ленивый прогрев (`lazy loading`): кэш заполняет первый реальный запрос.

```text
пустой Redis
→ первый GET
→ miss
→ PostgreSQL
→ SET
→ кэш прогрет
```

После TTL или инвалидации прогрев повторяется. Первый пользователь после очистки ключа получает более медленный ответ, потому что его запрос обращается к PostgreSQL.

Предварительный прогрев при старте приложения, фоновая задача и отдельный скрипт прогрева пока не реализованы.

Формулировка для собеседования:

> Кэш прогревался лениво в рамках Cache-Aside. При cache miss сервис загружал актуальные данные из PostgreSQL, сериализовал их в JSON и сохранял в Redis с TTL. После истечения TTL или инвалидации следующий запрос повторно прогревал ключ.

## 14. Инвалидация кэша

Инвалидация означает сделать устаревшие данные кэша недействительными.

В проекте используется стратегия:

```text
delete-on-write / invalidate-on-write
```

После успешного создания, обновления или удаления товара в PostgreSQL удаляется ключ списка:

```text
успешный INSERT/UPDATE/DELETE
→ DEL products:all
→ следующий GET получает miss
→ читает свежий список
→ снова прогревает Redis
```

Пример для создания товара:

```go
func (s *ProductService) CreateProduct(
    ctx context.Context,
    request domain.Product,
) (domain.Product, error) {
    product, err := s.r.CreateProduct(ctx, request)
    if err != nil {
        return domain.Product{}, err
    }

    delErr := s.redis.Del(ctx, "products:all").Err()
    if delErr != nil {
        log.Println("redis cache delete error:", delErr)
    }

    return product, nil
}
```

Та же операция выполняется после успешных `UpdateProduct` и `DeleteProduct`.

Сначала изменяется PostgreSQL, затем удаляется кэш. Если операция PostgreSQL не удалась, рабочий кэш удалять не нужно.

Проверять ключ через `EXISTS` перед `DEL` не нужно:

```text
DEL существующего ключа → 1
DEL отсутствующего ключа → 0
```

`DEL` идемпотентен. Предварительный `EXISTS` добавил бы лишний сетевой запрос и не исключил бы гонку: ключ может исчезнуть между `EXISTS` и `DEL`.

Ошибка `DEL` логируется, но не отменяет успешное изменение PostgreSQL. TTL является дополнительной страховкой: устаревший ключ всё равно не останется навсегда.

Формулировка для собеседования:

> Мы использовали delete-on-write: после успешного изменения данных в PostgreSQL удаляли связанный ключ в Redis. Следующий GET получал cache miss и лениво восстанавливал кэш. TTL дополнительно ограничивал время хранения устаревших данных, если явная инвалидация не сработала.

## 15. HTTP-маршруты для проверки инвалидации

Проект использует `github.com/gorilla/mux`. HTTP-метод задаётся через `.Methods`, а не строкой `"GET /products"`:

```go
router.HandleFunc("/products", productHandler.HandleProducts).
    Methods(http.MethodGet)
router.HandleFunc("/products", productHandler.HandleCreateProduct).
    Methods(http.MethodPost)
router.HandleFunc("/products", productHandler.UpdateProduct).
    Methods(http.MethodPut)
router.HandleFunc("/products", productHandler.DeleteProduct).
    Methods(http.MethodDelete)
```

Синтаксис `"GET /products"` поддерживается стандартным `http.ServeMux` новых версий Go, но не используется так в `gorilla/mux`.

## 16. Команды Redis для ежедневной работы

```powershell
cd C:\dev\online-store\backend

# Проверить соединение
docker compose exec redis redis-cli PING

# Проверить наличие ключа
docker compose exec redis redis-cli EXISTS products:all

# Посмотреть JSON-значение
docker compose exec redis redis-cli GET products:all

# Посмотреть TTL в секундах
docker compose exec redis redis-cli TTL products:all

# Удалить только кэш товаров
docker compose exec redis redis-cli DEL products:all

# Посмотреть ключи учебной базы
docker compose exec redis redis-cli SCAN 0

# Очистить текущую Redis DB целиком
docker compose exec redis redis-cli FLUSHDB
```

Значения результатов:

```text
EXISTS: 1 → ключ существует
EXISTS: 0 → ключ отсутствует

DEL: 1 → ключ существовал и удалён
DEL: 0 → ключа не было
```

`FLUSHDB` удаляет все ключи выбранной Redis-базы. Для обычной проверки безопаснее использовать точечный `DEL products:all`.

## 17. Проверка Cache-Aside вручную

Сначала удалить ключ:

```powershell
docker compose exec redis redis-cli DEL products:all
```

Первый запрос:

```powershell
Invoke-RestMethod http://localhost:8090/products
```

Ожидаемый лог:

```text
cache miss
```

Проверить создание ключа:

```powershell
docker compose exec redis redis-cli EXISTS products:all
docker compose exec redis redis-cli TTL products:all
```

Второй запрос:

```powershell
Invoke-RestMethod http://localhost:8090/products
```

Ожидаемый лог:

```text
cache hit
```

В нашей локальной проверке miss занимал около `1.62 ms`, а hit около `355 µs` (`0.355 ms`), то есть примерно в 4.6 раза быстрее. Это демонстрация механизма, а не полноценный benchmark: результат зависит от Docker, нагрузки компьютера, прогрева соединений, объёма данных и внутренних кэшей PostgreSQL.

## 18. Проверка TTL

```text
DEL products:all
→ GET /products: miss и SET с TTL
→ TTL products:all: около 60
→ GET /products до истечения: hit
→ дождаться истечения
→ TTL products:all: -2
→ GET /products: новый miss
```

Не следует выполнять дополнительную команду Redis `TTL` при каждом пользовательском hit только ради логирования: это добавляет сетевой запрос и снижает пользу кэша. Для учебной проверки используем `redis-cli`.

## 19. Проверка инвалидации

Порядок проверки создания товара:

```text
1. GET /products
   → ключ прогрет

2. EXISTS products:all
   → 1

3. POST /products
   → PostgreSQL INSERT
   → DEL products:all

4. EXISTS products:all
   → 0

5. GET /products
   → cache miss
   → свежий список из PostgreSQL
   → новый SET
```

Для `PUT` и `DELETE` последовательность аналогична. В практической проверке ключ существовал перед операцией (`1`) и отсутствовал после неё (`0`).

## 20. Логи

Минимально полезные события:

```text
cache hit
cache miss
redis get error: ...
cache decode error: ...
cache marshal error: ...
redis cache set error: ...
redis cache delete error: ...
```

Не следует логировать весь JSON кэша: значение может быть большим или содержать чувствительные данные.

Текущий HTTP logging middleware пишет начало и завершение каждого запроса. Браузер также может отправить CORS preflight `OPTIONS`, а затем основной `POST`, поэтому при одном пользовательском действии в логах может быть несколько строк.

## 21. Частые ошибки, найденные во время реализации

1. Регистрировать `defer client.Close()` до проверки ошибки создания клиента.
2. Считать любую ошибку Redis cache miss. Только `redis.Nil` означает подтверждённое отсутствие ключа.
3. Инициализировать `cacheMiss = true`, из-за чего кэш перезаписывается даже после hit.
4. Выполнять PostgreSQL-запрос после успешного hit вместо раннего `return`.
5. Возвращать строку JSON из метода, который должен вернуть `[]domain.Product`.
6. Забывать, что `json.Unmarshal` возвращает только ошибку и заполняет переданный указатель.
7. Делать ранний `return` даже после ошибки `Unmarshal`.
8. Записывать кэш до проверки ошибки PostgreSQL.
9. Выполнять `SET` после ошибки `json.Marshal`.
10. Игнорировать `.Err()` результата `SET`, `GET` или `DEL`.
11. Логировать старую переменную `err` вместо `setErr` или `delErr`.
12. Делать `EXISTS` перед `DEL`, создавая лишний запрос и гонку.
13. Использовать один cache key для разных фильтров или страниц.
14. Изменить TTL в коде, но забыть удалить старый бессрочный ключ.
15. Путать внешний Docker-порт и порт приложения внутри контейнера.
16. Использовать синтаксис маршрутов стандартного `ServeMux` в `gorilla/mux`.

## 22. Что является источником истины

PostgreSQL — источник истины. Redis содержит производную, потенциально устаревающую копию данных для ускорения чтения.

Отсюда следуют правила:

```text
ошибка Redis + PostgreSQL доступен
→ запрос по возможности должен продолжить работать

ошибка PostgreSQL при miss
→ свежие данные получить нельзя
→ вернуть ошибку

успешное изменение PostgreSQL
→ инвалидировать связанный кэш
```

## 23. Что уже реализовано

- Redis в Docker Compose.
- Конфигурация Redis через environment variables.
- Создание клиента и проверка `PING`.
- Передача `*redis.Client` в `ProductService`.
- Cache key `products:all`.
- Различение hit, miss и ошибки Redis.
- JSON Marshal/Unmarshal.
- Ранний возврат при hit без PostgreSQL.
- Fallback в PostgreSQL при ошибке Redis.
- Заполнение кэша при miss.
- TTL в одну минуту.
- Ленивый прогрев.
- Delete-on-write для Create/Update/Delete.
- Минимальные логи hit/miss и ошибок.
- Ручная проверка через `redis-cli` и HTTP-запросы.

## 24. Что пока не реализовано

- TTL jitter.
- Демонстрация массового одновременного истечения ключей.
- Воспроизведение cache stampede.
- Защита одного горячего ключа через `singleflight` или локальный mutex.
- Защита при нескольких экземплярах сервиса через distributed lock Redis.
- Безопасное освобождение distributed lock через уникальный token и Lua script.
- Метрики hit/miss в Prometheus.
- Отдельные ключи для товара по ID.
- Полноценные ключи пагинации, фильтрации и поиска.
- Предварительный или фоновый прогрев.

Эти пункты нельзя приписывать текущему учебному проекту как уже реализованные.

## 25. Краткие ответы для собеседования

**Что такое Cache-Aside?**

Приложение само сначала проверяет кэш. При miss читает основную базу, сохраняет результат в кэш и возвращает клиенту. При hit основная база не вызывается.

**Что такое cache hit?**

Ключ найден, значение успешно декодировано и возвращено из Redis.

**Что такое cache miss?**

Redis доступен, но вернул `redis.Nil`, потому что ключ отсутствует.

**Как формируется cache key?**

Ключ должен однозначно описывать данные и параметры запроса. Для полного списка — `products:all`; для пагинации в ключ включаются page, limit, фильтры и сортировка.

**Что такое TTL?**

Срок жизни ключа. Он ограничивает время хранения устаревших данных и обеспечивает периодическое обновление кэша.

**Какой вид инвалидации используется?**

Delete-on-write: после успешных Create/Update/Delete в PostgreSQL удаляется `products:all`. TTL служит дополнительной страховкой.

**Как прогревается кэш?**

Лениво: первый запрос после запуска, TTL или инвалидации получает данные из PostgreSQL и записывает их в Redis.

**Что происходит после истечения TTL?**

Redis удаляет ключ. Следующий запрос получает miss, обращается к PostgreSQL и создаёт ключ заново.

## 26. Контрольный алгоритм реализации с нуля

```text
1. Добавить Redis в Docker Compose.
2. Добавить REDIS_ADDR, REDIS_PASSWORD и REDIS_DB.
3. Установить go-redis/v9.
4. Создать Redis-клиент и проверить PING с timeout.
5. Закрывать клиент через defer после проверки err.
6. Передать *redis.Client в ProductService.
7. Выбрать cache key, соответствующий реальному SQL-запросу.
8. В GET сначала выполнить Redis GET.
9. Различить err == nil, redis.Nil и остальные ошибки.
10. При hit выполнить Unmarshal и ранний return.
11. При miss прочитать PostgreSQL.
12. Проверить ошибку PostgreSQL до работы с кэшем.
13. Выполнить Marshal.
14. Выполнить Redis SET с TTL и проверить ошибку.
15. После успешных write-операций выполнить DEL ключа.
16. Проверить miss, hit, TTL и invalidation командами redis-cli.
17. Добавить минимальные логи и затем метрики.
```

Это завершённый базовый Cache-Aside. Следующие этапы обучения должны расширять его постепенно: TTL jitter, воспроизведение stampede, защита одного горячего ключа и поведение при нескольких экземплярах Go-сервиса.
