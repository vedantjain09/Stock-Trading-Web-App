CREATE DATABASE IF NOT EXISTS JoesStocksDB;

USE JoesStocksDB;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,Users
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 50000.00
);

CREATE TABLE IF NOT EXISTS Portfolio (
    trade_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    numStock INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Ensure the AUTO_INCREMENT values start at a specific point, in case this script is rerun
ALTER TABLE Users AUTO_INCREMENT=1001;
ALTER TABLE Portfolio AUTO_INCREMENT=1001;
