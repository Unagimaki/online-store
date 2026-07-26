package dto

import "online-store/internal/domain"

type AuthResult struct {
	User  domain.User
	Token string
}
