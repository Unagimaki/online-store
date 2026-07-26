package domain

import "time"

type User struct {
	PasswordHash string
	Email        string
	ID           int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
