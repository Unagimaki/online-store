package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"online-store/internal/config"
	"online-store/internal/database"
	"online-store/internal/handler"
	"online-store/internal/jwt"
	"online-store/internal/middleware"
	"online-store/internal/repository"
	"online-store/internal/service"
	"os"
	"os/signal"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/gorilla/mux"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	cfg, err := config.ReadConfig()
	if err != nil {
		return err
	}
	db, err := database.NewDb(*cfg)

	if err != nil {
		return err
	}
	defer db.Close()

	redisClient, err := database.NewRedisClient(*cfg)

	if err != nil {
		return err
	}
	defer redisClient.Close()

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}
	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres",
		driver,
	)
	if err != nil {
		return err
	}
	err = m.Up()
	if err != nil {
		if err != migrate.ErrNoChange {
			return err
		}
		log.Println("No new migrations")
	}

	productRepo := repository.NewProductRepo(db)
	productService := service.NewProductService(productRepo, redisClient)
	productHandler := handler.NewHandler(productService)

	authRepo := repository.NewAuthRepository(db)
	jwtService := jwt.NewJWTService([]byte(cfg.JWTKey))
	authService := service.NewAuthService(authRepo, jwtService)
	authHandler := handler.NewAuthHandler(authService)

	router := mux.NewRouter()
	handler := middleware.LoggingMiddleware(middleware.CorsMiddleware(router))
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	})
	router.HandleFunc("/products", productHandler.HandleProducts).Methods(http.MethodGet)
	router.HandleFunc("/products", productHandler.HandleCreateProduct).Methods(http.MethodPost)
	router.HandleFunc("/products", productHandler.UpdateProduct).Methods(http.MethodPut)
	router.HandleFunc("/products", productHandler.DeleteProduct).Methods(http.MethodDelete)
	router.HandleFunc("/auth/register", authHandler.Register)
	router.HandleFunc("/auth/login", authHandler.Login)

	server := &http.Server{
		Addr:    cfg.HttpAddress,
		Handler: handler,
	}
	errCh := make(chan error, 1)
	quit := make(chan os.Signal, 1)
	go func() {
		log.Printf("Server started on port %s", cfg.HttpAddress)
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			errCh <- err
		}
	}()
	signal.Notify(quit, os.Interrupt)
	select {
	case v := <-errCh:
		return fmt.Errorf("Server start error: %w", v)
	case <-quit:
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		return err
	}

	return nil
}
