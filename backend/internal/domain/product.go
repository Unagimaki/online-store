package domain

import "time"

type Product struct {
	ID          int64
	Name        string
	Category    int64
	Price       int64
	Description string
	Quantity    int64
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
