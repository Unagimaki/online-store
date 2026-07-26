package domain

import "time"

type Order struct {
	ID         int64
	UserID     int64
	TotalPrice int64
	Items      []OrderItem
	Status     OrderStatus
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
type OrderItem struct {
	ID              int64
	OrderID         int64
	ProductID       int64
	Quantity        int64
	PriceAtPurchase int64
}
type OrderStatus string

const (
	OrderStatusCreated   OrderStatus = "created"
	OrderStatusPaid      OrderStatus = "paid"
	OrderStatusShipped   OrderStatus = "pending"
	OrderStatusCancelled OrderStatus = "cancelled"
)
