CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    signature TEXT NOT NULL CHECK (signature != '')
);