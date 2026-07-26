package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"online-store/internal/api"
	"online-store/internal/domain"
)

type Handler struct {
	s AuthService
}

type RegisterRequest struct {
	email    string
	password string
}

func NewAuthHandler(service AuthService) *Handler {
	return &Handler{
		s: service,
	}
}

type AuthService interface {
	Register(ctx context.Context, user RegisterRequest) (domain.User, error)
	Login(ctx context.Context) (string, error)
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var registerRequest RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&registerRequest)
	if err != nil {
		api.ApiError(w, err)
	}
	user, err := h.s.Register(ctx, registerRequest)
	if err != nil {
		api.ApiError(w, err)
	}
	api.WriteJson(w, http.StatusOK, user)
}
