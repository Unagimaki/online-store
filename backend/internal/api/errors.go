package api

import (
	"errors"
	"net/http"
	"online-store/internal/apperrors"
)

type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func SendError(w http.ResponseWriter, message string, statusCode int) {
	ErrResponse := ErrorResponse{
		Code:    statusCode,
		Message: message,
	}
	WriteJson(w, statusCode, ErrResponse)
}

func ApiError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, apperrors.ErrUserAlreadyExists):
		SendError(w, "user already exists", http.StatusConflict)

	case errors.Is(err, apperrors.ErrNotFound):
		SendError(w, "resource not found", http.StatusNotFound)

	case errors.Is(err, apperrors.ErrInvalidCredentials):
		SendError(w, "invalid credentials", http.StatusUnauthorized)

	case errors.Is(err, apperrors.ErrInvalidEmail):
		SendError(w, "invalid email", http.StatusBadRequest)

	case errors.Is(err, apperrors.ErrInvalidPassword):
		SendError(w, "invalid password", http.StatusBadRequest)

	default:
		SendError(w, "internal server error", http.StatusInternalServerError)
	}
}
