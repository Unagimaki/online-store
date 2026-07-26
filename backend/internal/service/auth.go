package service

import (
	"context"
	"errors"
	"fmt"
	"online-store/internal/apperrors"
	"online-store/internal/domain"
	"online-store/internal/dto"
)

type AuthService struct {
	repo           AuthRepo
	tokenGenerator TokenGenerator
}

func NewAuthService(repo AuthRepo, token TokenGenerator) *AuthService {
	return &AuthService{
		repo:           repo,
		tokenGenerator: token,
	}
}

type AuthRepo interface {
	Create(ctx context.Context, user domain.User) (domain.User, error)
	FindByEmail(ctx context.Context, email string) (domain.User, error)
}
type TokenGenerator interface {
	GenerateToken(user domain.User) (string, error)
}

func (s *AuthService) Register(ctx context.Context, email, password string) (dto.AuthResult, error) {
	if !ValidateEmail(email) {
		return dto.AuthResult{}, apperrors.ErrInvalidEmail
	}
	if !ValidatePassword(password) {
		return dto.AuthResult{}, apperrors.ErrInvalidPassword
	}
	hash, err := HashPassword(password)
	if err != nil {
		return dto.AuthResult{}, fmt.Errorf("service Register: hash password: %w", err)
	}
	user := domain.User{
		Email:        email,
		PasswordHash: hash,
	}
	createdUser, err := s.repo.Create(ctx, user)
	if err != nil {
		return dto.AuthResult{}, fmt.Errorf("service Register: create user: %w", err)
	}
	token, err := s.tokenGenerator.GenerateToken(createdUser)
	if err != nil {
		return dto.AuthResult{}, fmt.Errorf("service Register: generate token: %w", err)
	}
	return dto.AuthResult{User: createdUser, Token: token}, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (dto.AuthResult, error) {
	if !ValidateEmail(email) {
		return dto.AuthResult{}, apperrors.ErrInvalidEmail
	}
	if !ValidatePassword(password) {
		return dto.AuthResult{}, apperrors.ErrInvalidPassword
	}
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return dto.AuthResult{}, apperrors.ErrInvalidCredentials
		}

		return dto.AuthResult{}, fmt.Errorf("service Login: find user: %w", err)
	}
	err = Compare(password, user.PasswordHash)
	if err != nil {
		return dto.AuthResult{}, fmt.Errorf("service Login: compare password: %w", err)
	}
	token, err := s.tokenGenerator.GenerateToken(user)
	if err != nil {
		return dto.AuthResult{}, fmt.Errorf("service Login: generate token: %w", err)
	}
	return dto.AuthResult{User: user, Token: token}, nil
}
