package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		requestID := fmt.Sprintf("%d", time.Now().UnixNano())
		ctx := context.WithValue(r.Context(), "request_id", requestID)

		log.Printf("request start: id=%s method=%s path=%s", requestID, r.Method, r.URL.Path)

		next.ServeHTTP(w, r.WithContext(ctx))

		log.Printf(
			"request completed: id=%s method=%s path=%s duration=%s",
			requestID,
			r.Method,
			r.URL.Path,
			time.Since(start).String(),
		)
	})
}
