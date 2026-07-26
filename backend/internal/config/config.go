package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DSN            string
	MigrationsPath string
	HttpAddress    string
	JWTKey         string
}

func ReadConfig() (*Config, error) {

	if err := godotenv.Load(); err != nil {
		return &Config{}, fmt.Errorf("read config error: %w", err)
	}

	return &Config{
		DSN:            os.Getenv("DSN"),
		MigrationsPath: os.Getenv("MIGRATIONS_PATH"),
		HttpAddress:    os.Getenv("HTTP_ADDR"),
		JWTKey:         os.Getenv("JWT_SECRET"),
	}, nil
}
