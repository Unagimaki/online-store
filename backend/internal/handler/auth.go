package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"online-store/internal/api"
	"online-store/internal/apperrors"
	"online-store/internal/dto"
	"online-store/pkg/logger"
)

type AuthHandler struct {
	s AuthService
}

type AuthRequest struct {
	Email    string
	Password string
}

type AuthResponse struct {
	Token string `json:"token"`
	Email string `json:"email"`
	ID    int64  `json:"id"`
}

func NewAuthHandler(service AuthService) *AuthHandler {
	return &AuthHandler{
		s: service,
	}
}

type AuthService interface {
	Register(ctx context.Context, email, password string) (dto.AuthResult, error)
	Login(ctx context.Context, email, password string) (dto.AuthResult, error)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var authRequest AuthRequest
	err := json.NewDecoder(r.Body).Decode(&authRequest)
	if err != nil {
		logger.Error("handler", "Register", err, "decode request body")
		api.ApiError(w, err)
		return
	}

	result, err := h.s.Register(ctx, authRequest.Email, authRequest.Password)
	if err != nil {
		if !errors.Is(err, apperrors.ErrInvalidEmail) &&
			!errors.Is(err, apperrors.ErrInvalidPassword) &&
			!errors.Is(err, apperrors.ErrUserAlreadyExists) {
			logger.Error("handler", "Register", err, "service.Register")
		}

		api.ApiError(w, err)
		return
	}
	authResponse := AuthResponse{
		Token: result.Token,
		Email: result.User.Email,
		ID:    result.User.ID,
	}
	api.WriteJson(w, http.StatusOK, authResponse)
}
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var authRequest AuthRequest
	err := json.NewDecoder(r.Body).Decode(&authRequest)
	if err != nil {
		logger.Error("handler", "Login", err, "decode request body")
		api.ApiError(w, err)
		return
	}

	result, err := h.s.Login(ctx, authRequest.Email, authRequest.Password)
	if err != nil {
		if !errors.Is(err, apperrors.ErrInvalidEmail) &&
			!errors.Is(err, apperrors.ErrInvalidPassword) &&
			!errors.Is(err, apperrors.ErrInvalidCredentials) {
			logger.Error("handler", "Login", err, "service.Login")
		}

		api.ApiError(w, err)
		return
	}
	authResponse := AuthResponse{
		Token: result.Token,
		Email: result.User.Email,
		ID:    result.User.ID,
	}

	api.WriteJson(w, http.StatusOK, authResponse)
}
