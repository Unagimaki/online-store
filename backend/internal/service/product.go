package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"online-store/internal/domain"

	"time"

	"github.com/redis/go-redis/v9"
)

type ProductService struct {
	r     ProductRepository
	redis *redis.Client
}

func NewProductService(r ProductRepository, redis *redis.Client) *ProductService {
	return &ProductService{
		r:     r,
		redis: redis,
	}
}

type ProductRepository interface {
	GetProducts(ctx context.Context, page int, limit int) ([]domain.Product, error)
	CreateProduct(ctx context.Context, productRequest domain.Product) (domain.Product, error)
	GetProductById(ctx context.Context, id int64) (domain.Product, error)
	UpdateProduct(ctx context.Context, product domain.Product) (domain.Product, error)
	DeleteProduct(ctx context.Context, id int64) error
}

func (s *ProductService) GetProducts(ctx context.Context, page int, limit int) ([]domain.Product, error) {
	var cacheMiss bool = false
	var cachedProducts []domain.Product
	cachedData, err := s.redis.Get(ctx, "products:all").Result()
	if err == nil {
		err := json.Unmarshal([]byte(cachedData), &cachedProducts)
		if err != nil {
			log.Println(err)
			cacheMiss = true
		} else {
			log.Println("cache hit")
			return cachedProducts, nil
		}
	} else if errors.Is(err, redis.Nil) {
		log.Println("cache miss")
		cacheMiss = true
	} else {
		log.Println("redis err: ", err)
	}
	products, err := s.r.GetProducts(ctx, page, limit)
	if err != nil {
		return []domain.Product{}, err
	}
	if cacheMiss {
		data, err := json.Marshal(products)
		if err != nil {
			log.Println("json err: ", err)
		} else {
			setErr := s.redis.Set(ctx, "products:all", data, time.Minute).Err()
			if setErr != nil {
				log.Println("redis cache set error: ", setErr)
			}
		}
	}

	return products, nil
}

func (s *ProductService) CreateProduct(ctx context.Context, productRequest domain.Product) (domain.Product, error) {
	product, err := s.r.CreateProduct(ctx, productRequest)
	if err != nil {
		return domain.Product{}, err
	}
	err = s.redis.Del(ctx, "products:all").Err()
	if err != nil {
		log.Println(err)
	}
	return product, nil
}

func (s *ProductService) GetProductById(ctx context.Context, id int64) (domain.Product, error) {
	product, err := s.r.GetProductById(ctx, id)
	if err != nil {
		return domain.Product{}, err
	}
	return product, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, product domain.Product) (domain.Product, error) {
	updatedProduct, err := s.r.UpdateProduct(ctx, product)
	if err != nil {
		return domain.Product{}, err
	}
	err = s.redis.Del(ctx, "products:all").Err()
	if err != nil {
		log.Println(err)
	}
	return updatedProduct, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, id int64) error {
	err := s.r.DeleteProduct(ctx, id)
	if err != nil {
		return err
	}
	err = s.redis.Del(ctx, "products:all").Err()
	if err != nil {
		log.Println(err)
	}

	return nil
}
