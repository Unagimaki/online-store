package service

func ValidatePassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	return true
}
func ValidateEmail(email string) bool {
	if len(email) < 5 {
		return false
	}
	return true
}
