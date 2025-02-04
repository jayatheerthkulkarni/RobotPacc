# RobotPacc - Inventory Management System

## Overview
RobotPacc is a robust inventory management system designed to streamline the handling of product master data, suppliers, customers, and stock movements. It features a modern web-based frontend built with Svelte and Vite, while the backend is powered by Node.js with Express and SQLite for lightweight data storage.

This system is preloaded with dummy values for testing and development purposes.

## Features
- **Product Management**: Track product master data, including stock levels, pricing, and descriptions.
- **Supplier Management**: Maintain supplier records and link them to supplied items.
- **Customer Management**: Store customer details for order and transaction tracking.
- **Stock Transactions**:
  - **Inward Transactions**: Record stock received from suppliers.
  - **Outward Transactions**: Manage stock issued to customers.
- **User-Friendly Interface**: Built with **Svelte** and **Vite** for an optimized and modular frontend experience.
- **Lightweight Backend**:
  - Developed with **Node.js** and **Express**.
  - Uses **SQLite** for efficient and lightweight data storage.
  - Integrated API endpoints for seamless data operations.

## Project Structure
```
robotpacc/
├── client/              # Frontend (Svelte, Vite)
│   ├── Add-Customers/
│   ├── Add-Items/
│   ├── Add-Suppliers/
│   ├── Inward/
│   ├── Outward/
│   ├── Home/
│   ├── Inwards/
│   ├── Outwards/
│   ├── Pmaster/
├── server/              # Backend (Node.js, Express, SQLite)
│   ├── routes.js        # API endpoints
│   ├── db.js            # Database connection
│   ├── server.js        # Main backend server file
│   ├── seed.js          # Database seeding script
│   ├── data.db          # SQLite database file
│   ├── package.json     # Backend dependencies
├── vite/                # Vite frontend configurations
├── commands.txt         # SQL schema commands
└── package.json         # Project dependencies
```

## Installation
### Prerequisites
- **Bun.js** (>= 1.2)
- **SQLite3**
- **Bun Package Manager** (for server dependencies)

### Setup
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd robotpacc
   ```
2. Install dependencies:
   ```sh
   bun install
   ```
3. Initialize the database:
   ```sh
   bun server/seed.js
   ```
4. Start the backend server:
   ```sh
   bun run server/server.js
   ```
5. Start the frontend:
   ```sh
   cd client
   vite
   ```

## API Endpoints
The backend exposes REST API endpoints via Express:

### Product Management
- `GET /products` - Fetch all products
- `POST /products` - Add a new product
- `GET /products/:id` - Fetch a specific product
- `PUT /products/:id` - Update product details
- `DELETE /products/:id` - Remove a product

### Supplier Management
- `GET /suppliers` - Retrieve supplier details
- `POST /suppliers` - Add a new supplier
- `GET /suppliers/:id` - Fetch a specific supplier
- `PUT /suppliers/:id` - Update supplier details
- `DELETE /suppliers/:id` - Remove a supplier

### Customer Management
- `GET /customers` - Retrieve customer details
- `POST /customers` - Add a new customer
- `GET /customers/:id` - Fetch a specific customer
- `PUT /customers/:id` - Update customer details
- `DELETE /customers/:id` - Remove a customer

### Inventory Transactions
- `GET /inwards` - Fetch all inward transactions
- `POST /inwards` - Add an inward stock transaction
- `GET /inwards/:id` - Fetch a specific inward transaction
- `PUT /inwards/:id` - Update an inward transaction
- `DELETE /inwards/:id` - Remove an inward transaction
- `GET /outwards` - Fetch all outward transactions
- `POST /outwards` - Record an outward stock transaction
- `GET /outwards/:id` - Fetch a specific outward transaction
- `PUT /outwards/:id` - Update an outward transaction
- `DELETE /outwards/:id` - Remove an outward transaction

## Technologies Used
- **Frontend**: Svelte, Vite
- **Backend**: Bun.js, Express
- **Database**: SQLite
- **Package Management**: Bun

## License
This project was conceptualized and developed by **K Jayatheerth**, in coordination with **Geethanjali College of Engineering and Technology**, with **industry collaboration from RobotPacc**.

## Contributors
- **K Jayatheerth**