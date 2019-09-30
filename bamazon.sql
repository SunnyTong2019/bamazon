DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments (
department_id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR(100) NULL,
over_head_costs DECIMAL(10,2) DEFAULT 1000.00,
PRIMARY KEY (department_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("TV", "Electronics", 999.99, 20),("Headphone", "Electronics", 89.50, 45),
("Cell Phone", "Electronics", 780.59, 82),("Utensil", "Kitchen", 12.00, 750),
("Dinnerware Set", "Kitchen", 42.85, 61),("Sofa", "Furniture", 2054.90, 13),
("Desk", "Furniture", 501.45, 4),("Bed", "Furniture", 3509.30, 56),
("Napkins", "Household", 6.75, 317),("Light Bulb", "Household", 0.98, 98);

INSERT INTO departments (department_name)
VALUES ("Electronics"),("Kitchen"), ("Furniture"), ("Household");