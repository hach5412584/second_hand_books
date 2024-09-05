-- Create database
CREATE DATABASE booksdb;

-- Connect to booksdb
\c booksdb;

-- Create table books
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(13) NOT NULL,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    summary VARCHAR(100),
    category VARCHAR(100),
    author VARCHAR(100),
    publication_date DATE,
    image BYTEA
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);