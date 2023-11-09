-- Create Catalog Database
CREATE DATABASE IF NOT EXISTS Catalog;
USE Catalog;

-- Categories Table
CREATE TABLE Categories (
    id INT PRIMARY KEY,
    parentCategoryId INT,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (parentCategoryId) REFERENCES Categories(id)
);

-- Products Table
CREATE TABLE Products (
    id CHAR(36) PRIMARY KEY,
    categoryId INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    previewImageUrls TEXT,
    FOREIGN KEY (categoryId) REFERENCES Categories(id)
);

-- Create a read-only user for the Catalog database
CREATE USER 'catalogReader' IDENTIFIED BY 'qwerty123';
GRANT SELECT ON Catalog.* TO 'catalogReader';

CREATE USER 'catalogWriter' IDENTIFIED BY 'qwerty123';
GRANT SELECT, INSERT, UPDATE, DELETE ON Catalog.* TO 'catalogWriter';
