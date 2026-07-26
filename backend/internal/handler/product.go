package handler

import (
	"context"
	"encoding/json"
	_ "fmt"
	"net/http"
	"online-store/internal/api"
	"online-store/internal/domain"
	"strconv"
)

type ProductParams struct {
	Limit int
	Page  int
}

type ProductHandler struct {
	s ProductService
}

func NewHandler(s ProductService) *ProductHandler {
	return &ProductHandler{
		s: s,
	}
}

type ProductService interface {
	GetProducts(ctx context.Context, page int, limit int) ([]domain.Product, error)
	CreateProduct(ctx context.Context, product domain.Product) (domain.Product, error)
	GetProductById(ctx context.Context, id int64) (domain.Product, error)
	UpdateProduct(ctx context.Context, product domain.Product) (domain.Product, error)
	DeleteProduct(ctx context.Context, id int64) error
}

func (h *ProductHandler) HandleProducts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	limit := 20
	page := 1
	query := r.URL.Query()
	limit_query := query.Get("limit")
	limit_page := query.Get("page")

	if limit_query != "" {
		l, err := strconv.Atoi(limit_query)
		if err != nil || l <= 0 || l > 100 {
			http.Error(w, "invalid limit param", http.StatusBadRequest)
			return
		}
	}

	if limit_page != "" {
		p, err := strconv.Atoi(limit_page)
		if err != nil || p <= 0 {
			http.Error(w, "invalid page param", http.StatusBadRequest)
			return
		}
	}

	params := ProductParams{
		Limit: limit,
		Page:  page,
	}
	products, err := h.s.GetProducts(ctx, params.Page, params.Limit)
	if err != nil {
		api.ApiError(w, err)
		return
	}
	api.WriteJson(w, http.StatusOK, products)
}

func (h *ProductHandler) HandleCreateProduct(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var productRequest ProductRequest
	err := json.NewDecoder(r.Body).Decode(&productRequest)
	if err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	product := domain.Product{
		Name:        productRequest.Name,
		Category:    productRequest.Category,
		Price:       productRequest.Price,
		Description: productRequest.Description,
	}
	if err := Validate(product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	data, err := h.s.CreateProduct(ctx, product)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	api.WriteJson(w, http.StatusCreated, data)
}

func (h *ProductHandler) GetProductById(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := r.URL.Query().Get("id")
	idInt, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		http.Error(w, "invalid id param", http.StatusBadRequest)
		return
	}

	product, err := h.s.GetProductById(ctx, idInt)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	api.WriteJson(w, http.StatusOK, product)

}

func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	var product domain.Product
	ctx := r.Context()
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if err := Validate(product); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	product, err = h.s.UpdateProduct(ctx, product)
	if err != nil {
		api.ApiError(w, err)
		return
	}
	json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	ctx := r.Context()
	idInt, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		http.Error(w, "ivalid id", http.StatusBadRequest)
		return
	}
	err = h.s.DeleteProduct(ctx, idInt)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
