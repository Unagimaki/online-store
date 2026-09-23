FROM golang:1.25.0 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o online-store ./cmd

FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/online-store .
COPY migrations ./migrations

EXPOSE 8080

CMD ["./online-store"]
