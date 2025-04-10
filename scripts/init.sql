-- First, clean up existing tables and types
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS cart_status CASCADE;

CREATE TYPE order_status AS ENUM ('CREATED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE cart_status AS ENUM ('OPEN', 'ORDERED');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create carts table with user foreign key
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status cart_status NOT NULL DEFAULT 'OPEN',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    count INTEGER NOT NULL CHECK (count > 0),
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES carts(id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cart_id UUID NOT NULL,
    payment JSONB NOT NULL,
    delivery JSONB NOT NULL,
    comments TEXT,
    status order_status NOT NULL DEFAULT 'CREATED',
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cart_id) REFERENCES carts(id)
);

-- Insert test data
INSERT INTO users (id, email, password) VALUES
(
    '7e63f6a0-b2d1-4f42-a8a5-e9ecb7ec4f9c',
    'john.doe@gmail.com',
    '$2a$10$xJww9L5ZvoY63JZ/GjcQAe4DjwNVCa3SX7HHNC5ON7Jh0wd1J3yIi'
),
(
    '9d38e7f4-19cf-4d34-8d95-62b6407240f2',
    'sarah.wilson@outlook.com',
    '$2a$10$3fKmU.rA.ZJhYeR3dhPzxe1YJ9rw/jIGGUCmJxGz7POuPPYH6VH6q'
),
(
    '25b97b8c-abf3-47db-a8b7-df7c3c1c4c82',
    'michael.chen@yahoo.com',
    '$2a$10$t3FT7LZb.KRbdWc9BVZtQezzww7JUjpzeEDfKdVKnPl56QfN7sTDG'
);

INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
(
    '83f05e4b-f240-48c0-888d-0d1e91e9831e',
    '7e63f6a0-b2d1-4f42-a8a5-e9ecb7ec4f9c',
    CURRENT_TIMESTAMP - INTERVAL '2 hours 15 minutes',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    'OPEN'
),
(
    'c27e6a5d-942b-4c40-a757-f0d7f7e2e71e',
    '7e63f6a0-b2d1-4f42-a8a5-e9ecb7ec4f9c',
    CURRENT_TIMESTAMP - INTERVAL '4 days 8 hours',
    CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours',
    'ORDERED'
),
(
    '4a99c57e-b0d5-4c9c-9e6b-24d67f692a33',
    '9d38e7f4-19cf-4d34-8d95-62b6407240f2',
    CURRENT_TIMESTAMP - INTERVAL '9 days 14 hours',
    CURRENT_TIMESTAMP - INTERVAL '8 days 6 hours',
    'ORDERED'
);

INSERT INTO cart_items (cart_id, product_id, count) VALUES
(
    '83f05e4b-f240-48c0-888d-0d1e91e9831e',
    'a17fe23d-96eb-45c9-a6d2-4924d2b31449',
    3
),
(
    'c27e6a5d-942b-4c40-a757-f0d7f7e2e71e',
    'b8e7e6f0-c192-4bfb-a4d1-39b29b3b9c01',
    1
),
(
    'c27e6a5d-942b-4c40-a757-f0d7f7e2e71e',
    'f4d2c987-8fb9-4e7a-9a76-4c2ee3bdd82a',
    2
),
(
    '4a99c57e-b0d5-4c9c-9e6b-24d67f692a33',
    'c7b59a42-e96c-44b9-b253-1b91dc9d9ef5',
    4
);

-- Insert orders for the ORDERED carts
INSERT INTO orders (
    id,
    user_id,
    cart_id,
    payment,
    delivery,
    comments,
    status,
    total,
    created_at,
    updated_at
) VALUES
(
    'e892f85a-08b9-4eda-b6d2-ab0c248f2e40',
    '7e63f6a0-b2d1-4f42-a8a5-e9ecb7ec4f9c',
    'c27e6a5d-942b-4c40-a757-f0d7f7e2e71e',
    '{"method": "credit_card", "card_last4": "5678", "amount": 129.99, "transaction_id": "txn_3J5X7qLkdIwDVf1A0"}'::jsonb,
    '{"address": "42 Maple Avenue", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}'::jsonb,
    'Please leave package at the front door, no signature required',
    'PAID',
    129.99,
    CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours 45 minutes',
    CURRENT_TIMESTAMP - INTERVAL '1 day 17 hours 22 minutes'
),
(
    '7d9f0dc5-b32a-4f6e-b3f7-c06c920edcc1',
    '9d38e7f4-19cf-4d34-8d95-62b6407240f2',
    '4a99c57e-b0d5-4c9c-9e6b-24d67f692a33',
    '{"method": "paypal", "email": "sarah.wilson@outlook.com", "amount": 245.50, "transaction_id": "PAY-9HG237450X071441GLQUY6ZI"}'::jsonb,
    '{"address": "183 Ocean Drive", "city": "Miami", "state": "FL", "zip": "33139", "country": "USA"}'::jsonb,
    'This is a gift, please include gift receipt and gift wrap',
    'SHIPPED',
    245.50,
    CURRENT_TIMESTAMP - INTERVAL '8 days 6 hours 12 minutes',
    CURRENT_TIMESTAMP - INTERVAL '7 days 9 hours 41 minutes'
);

-- Verify the data
SELECT * FROM users ORDER BY created_at DESC;

SELECT 
    c.id as cart_id,
    c.status as cart_status,
    u.email as user_email,
    c.created_at,
    c.updated_at
FROM carts c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

SELECT 
    o.id as order_id,
    u.email as user_email,
    o.status as order_status,
    o.total,
    ci.product_id,
    ci.count,
    o.payment->>'method' as payment_method,
    o.delivery->>'address' as delivery_address
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN cart_items ci ON ci.cart_id = o.cart_id
ORDER BY o.created_at DESC;
