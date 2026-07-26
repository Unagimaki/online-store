package service

import (
	"context"
	"online-store/internal/domain"
)

type ProductService struct {
	r ProductRepository
}

func NewProductService(r ProductRepository) *ProductService {
	return &ProductService{
		r: r,
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
	products, err := s.r.GetProducts(ctx, page, limit)
	if err != nil {
		return []domain.Product{}, err
	}
	return products, nil
}

func (s *ProductService) CreateProduct(ctx context.Context, productRequest domain.Product) (domain.Product, error) {
	product, err := s.r.CreateProduct(ctx, productRequest)
	if err != nil {
		return domain.Product{}, err
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
	return updatedProduct, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, id int64) error {
	err := s.r.DeleteProduct(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
