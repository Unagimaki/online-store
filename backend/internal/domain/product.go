package domain

import "time"

type Product struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Category    int64     `json:"category"`
	Price       int64     `json:"price"`
	Description string    `json:"description"`
	Quantity    int64     `json:"quantity"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
