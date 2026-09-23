package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"online-store/internal/apperrors"
	"online-store/internal/domain"
)

type ProductRepo struct {
	db *sql.DB
}

func NewProductRepo(db *sql.DB) *ProductRepo {
	return &ProductRepo{
		db: db,
	}
}

func (r *ProductRepo) GetProducts(ctx context.Context, page, limit int) ([]domain.Product, error) {
	products := []domain.Product{}
	rows, err := r.db.QueryContext(ctx, "SELECT id, name, price, category_id, description, quantity FROM products")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var product domain.Product
		if err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Price,
			&product.Category,
			&product.Description,
			&product.Quantity,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepo) CreateProduct(ctx context.Context, product domain.Product) (domain.Product, error) {
	query := `
	INSERT INTO products (
		name,
		category_id,
		price,
		description,
		quantity
	)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id, created_at;
	`
	row := r.db.QueryRowContext(
		ctx, query,
		product.Name,
		product.Category,
		product.Price,
		product.Description,
		product.Quantity,
	)
	err := row.Scan(&product.ID, &product.CreatedAt)
	if err != nil {
		return domain.Product{}, fmt.Errorf("repository create product: %w", err)
	}
	return product, nil
}

func (r *ProductRepo) GetProductById(ctx context.Context, id int64) (domain.Product, error) {
	var product domain.Product
	row := r.db.QueryRowContext(ctx, "SELECT id, name, price, category_id, description, quantity FROM products WHERE id = $1", id)
	err := row.Scan(
		&product.ID,
		&product.Name,
		&product.Price,
		&product.Category,
		&product.Description,
		&product.Quantity,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Product{}, apperrors.ErrNotFound
		}

		return domain.Product{}, err
	}
	return product, nil
}

func (r *ProductRepo) UpdateProduct(ctx context.Context, product domain.Product) (domain.Product, error) {
	query := `
		UPDATE products
		SET
			name = $1,
			price = $2,
			category_id = $3,
			description = $4,
			quantity = $5,
			updated_at = NOW()
		WHERE id = $6
		RETURNING id, name, price, category_id, description, quantity, updated_at
	`
	row := r.db.QueryRowContext(ctx, query, product.Name, product.Price, product.Category, product.Description, product.Quantity, product.ID)
	err := row.Scan(
		&product.ID,
		&product.Name,
		&product.Price,
		&product.Category,
		&product.Description,
		&product.Quantity,
		&product.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Product{}, apperrors.ErrNotFound
		}
		return domain.Product{}, err
	}
	return product, nil
}

func (r *ProductRepo) DeleteProduct(ctx context.Context, id int64) error {
	result, err := r.db.ExecContext(ctx, "DELETE FROM products WHERE id = $1", id)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return apperrors.ErrNotFound
	}

	return nil
}
