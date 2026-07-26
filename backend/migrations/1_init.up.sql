CREATE TABLE users (
    id bigserial PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);

CREATE TABLE categories (
    id bigserial PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE products (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    category_id bigint NOT NULL REFERENCES categories(id),
    price bigint NOT NULL CHECK (price >= 0),
    description text,
    quantity integer NOT NULL CHECK (quantity >= 0),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);

CREATE TABLE carts (
    id bigserial PRIMARY KEY UNIQUE,
    user_id bigint NOT NULL REFERENCES users(id)
);

CREATE TABLE orders (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id),
    total_price bigint NOT NULL CHECK (total_price >= 0),
    status text NOT NULL CHECK (status IN ('created', 'paid', 'pending', 'cancelled')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);

CREATE TABLE cart_items (
    id bigserial PRIMARY KEY,
    cart_id bigint NOT NULL REFERENCES carts(id),
    product_id bigint NOT NULL REFERENCES products(id),
    quantity integer NOT NULL CHECK (quantity > 0)
);

CREATE TABLE order_items (
    id bigserial PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES orders(id),
    product_id bigint NOT NULL REFERENCES products(id),
    quantity integer NOT NULL CHECK (quantity > 0),
    price_at_purchase bigint NOT NULL CHECK (price_at_purchase >= 0)
);