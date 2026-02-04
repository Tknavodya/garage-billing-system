-- Database Creation
CREATE DATABASE IF NOT EXISTS garage_management;
USE garage_management;

-- 1. Users Table (Admin Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- In real app, store hashed passwords
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT,
    license_plate VARCHAR(20),
    vin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4. Services Table (Catalog)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- e.g., 'Maintenance', 'Brakes'
    price DECIMAL(10, 2) NOT NULL,
    duration VARCHAR(20), -- e.g., '30 min'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Parts Table (Inventory)
CREATE TABLE IF NOT EXISTS parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    part_number VARCHAR(50),
    category VARCHAR(50), -- e.g., 'Filters', 'Liquids'
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    date DATE NOT NULL,
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Pending', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
);

-- 7. Invoice Items Table (Line Items)
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    service_id INT, -- Nullable if item is a part
    part_id INT,    -- Nullable if item is a service
    item_name VARCHAR(255) NOT NULL, -- Snapshotted name in case catalog changes
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE SET NULL
);

-- 8. Settings Table (Key-Value)
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255)
);

-- =============================================
-- SEED DATA (Mock Data for Testing)
-- =============================================

-- Users
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@garage.com', 'admin123', 'admin'); -- Note: Replace 'admin123' with hash in real backend

-- Customers
INSERT INTO customers (name, email, phone, address) VALUES
('John Doe', 'john@example.com', '(555) 123-4567', '123 Maple St, Springfiled'),
('Alice Smith', 'alice@example.com', '(555) 987-6543', '456 Oak Ave, Metropolis');

-- Vehicles
INSERT INTO vehicles (customer_id, make, model, year, license_plate) VALUES
(1, 'Toyota', 'Camry', 2018, 'XYZ-123'),
(2, 'Honda', 'Civic', 2020, 'ABC-987');

-- Services
INSERT INTO services (name, description, category, price, duration) VALUES
('Standard Oil Change', 'Complete oil change with synthetic blend', 'Maintenance', 4500, '30 min'),
('Brake Pad Replacement', 'Front or rear brake pads', 'Brakes', 8500, '1 hr'),
('Tire Rotation', 'Rotate all 4 tires', 'Tires', 2500, '45 min');

-- Parts
INSERT INTO parts (name, part_number, category, price, stock, min_stock) VALUES
('Oil Filter', 'OF-2024-A', 'Filters', 1800, 45, 10),
('Brake Pads (Front)', 'BP-F-001', 'Brakes', 6500, 8, 15),
('Synthetic Oil (5W-30)', 'OIL-SYN', 'Fluids', 4800, 60, 20);

-- Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('garage_name', 'AutoGarage Pro'),
('tax_rate', '8.0'),
('currency', 'LKR');

-- Invoices (Sample Pending Invoice)
INSERT INTO invoices (invoice_number, customer_id, vehicle_id, date, subtotal, tax_amount, total_amount, status) 
VALUES ('INV-001', 1, 1, CURRENT_DATE, 6300, 0, 6300, 'Pending');

INSERT INTO invoice_items (invoice_id, service_id, item_name, quantity, unit_price, total_price)
VALUES (1, 1, 'Standard Oil Change', 1, 4500, 4500);

INSERT INTO invoice_items (invoice_id, part_id, item_name, quantity, unit_price, total_price)
VALUES (1, 1, 'Oil Filter', 1, 1800, 1800);
