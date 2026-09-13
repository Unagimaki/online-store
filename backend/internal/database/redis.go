package database

import (
	"context"
	"fmt"
	"online-store/internal/config"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient(cfg config.Config) (*redis.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
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
