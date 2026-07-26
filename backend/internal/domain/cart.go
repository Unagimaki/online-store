package domain

type Cart struct {
	ID     int64
	UserID int64
	Items  []CartItem
}

type CartItem struct {
	ID        int64
	ProductID int64
	Quantity  int64
}
