package auth

import (
	"context"
	"online-store/internal/domain"
)

type Service struct {
	r AuthRepo
}

func NewAuthService(repo AuthRepo) *Service {
	return &Service{
		r: repo,
	}
}

type AuthRepo interface {
	Register(ctx context.Context, user domain.User) (domain.User, error)
	Login(ctx context.Context) (string, error)
}

func (s *Service) Register(ctx context.Context, user RegisterRequest) (domain.User, error) {
	RegisterRequest, err := s.r.Register(ctx, user)
	if err != nil {
		return domain.User{}, err
	}
	return RegisterRequest, nil
}
