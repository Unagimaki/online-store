package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"online-store/internal/apperrors"
	"online-store/internal/domain"

	"github.com/lib/pq"
)

type Repository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Create(ctx context.Context, user domain.User) (domain.User, error) {
	query := "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email"

	row := r.db.QueryRowContext(ctx, query, user.Email, user.PasswordHash)

	var createdUser domain.User

	err := row.Scan(&createdUser.ID, &createdUser.Email)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return domain.User{}, apperrors.ErrUserAlreadyExists
		}

		return domain.User{}, fmt.Errorf("repository Create: %w", err)
	}

	return createdUser, nil
}
func (r *Repository) FindByEmail(ctx context.Context, email string) (domain.User, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, email, password_hash FROM users WHERE email = $1",
		email,
	)

	var user domain.User

	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.User{}, apperrors.ErrNotFound
		}

		return domain.User{}, fmt.Errorf("repository FindByEmail: %w", err)
	}

	return user, nil
}
