package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DSN            string
	MigrationsPath string
	HttpAddress    string
	JWTKey         string
	RedisAddress   string
	RedisPassword  string
	RedisDb        string
}

func ReadConfig() (*Config, error) {

	_ = godotenv.Load()

	return &Config{
		DSN:            os.Getenv("DSN"),
		MigrationsPath: os.Getenv("MIGRATIONS_PATH"),
		HttpAddress:    os.Getenv("HTTP_ADDR"),
		JWTKey:         os.Getenv("JWT_SECRET"),
		RedisAddress:   os.Getenv("REDIS_ADDR"),
		RedisPassword:  os.Getenv("REDIS_PASSWORD"),
		RedisDb:        os.Getenv("REDIS_DB"),
	}, nil
}
