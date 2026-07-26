package apperrors

import "errors"

var (
	ErrUserAlreadyExists  = errors.New("user already exists")
	ErrNotFound           = errors.New("not found")
	ErrInvalidEmail       = errors.New("invalid email")
	ErrInvalidPassword    = errors.New("invalid password")
	ErrInvalidCredentials = errors.New("invalid credentials")
)
