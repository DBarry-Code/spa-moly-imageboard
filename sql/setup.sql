-- drop existing users table
DROP TABLE IF EXISTS user_profiles;

-- drop existing signatures table
DROP TABLE IF EXISTS signatures;

-- drop existing users table
DROP TABLE IF EXISTS users;

-- create a new users table:
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(255) NOT NULL,
    last_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create a new user_profiles table:
CREATE TABLE user_profiles (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users (id),
    age         INTEGER,
    city        VARCHAR(255) NOT NULL,
    homepage    VARCHAR(255) NOT NULL
);


-- create a new signatures table:
CREATE TABLE signatures (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature   TEXT NOT NULL CHECK (signature != '')
);