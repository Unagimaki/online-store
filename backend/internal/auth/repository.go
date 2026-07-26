package auth

import (
	"context"
	"database/sql"
	"online-store/internal/domain"
)

type Repository struct {
	r *sql.DB
}

func (r *Repository) Register(ctx context.Context, user RegisterRequest) (domain.User, error) {

}
