package database

import (
	"database/sql"
	"fmt"
	"online-store/internal/config"
	"time"

	_ "github.com/lib/pq"
)

func NewDb(cfg config.Config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.DSN)

	if err != nil {
		return nil, fmt.Errorf("db create error: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("db ping error: %w", err)
	}
	db.SetConnMaxLifetime(time.Minute)
	db.SetMaxIdleConns(5)
	db.SetMaxOpenConns(25)
	return db, nil
}
