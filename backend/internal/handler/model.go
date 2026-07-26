package handler

import (
	"fmt"
	"online-store/internal/domain"
)

type ProductRequest struct {
	Name        string `json:"name"`
	Category    int64  `json:"category"`
	Price       int64  `json:"price"`
	Description string `json:"description"`
}

func Validate(product domain.Product) error {
	if product.Name == "" {
		return fmt.Errorf("name is empty")
	}
	if product.Price <= 0 {
		return fmt.Errorf("invalid price")
	}
	return nil
}
