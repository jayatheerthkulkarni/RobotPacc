# RobotPacc - Inventory Management System

## Overview
RobotPacc is an inventory management system designed to handle product masters, suppliers, customers, and stock movements. It features a web-based frontend and a backend that utilizes SQLite for data persistence.

The database already contains some dummy values for testing purpose.
## Features
- **Product Management:** Maintain product master data, including stock levels, pricing, and descriptions.
- **Supplier Management:** Track supplier information and link them to supplied items.
- **Customer Management:** Store customer details for order tracking.
- **Stock Transactions:** Manage inwards (receipts from suppliers) and outwards (sales to customers) transactions.
- **User Interface:** Built with Svelte and Vite for an optimized and modular frontend experience.
- **Server Backend:** Implemented using Node.js with Express and SQLite for lightweight, efficient data storage.

## Project Structure
```
robotpacc/
├── client/              # Frontend (Svelte, Vite)
│   ├── Add-Items/
│   ├── Home/
│   ├── Pmaster/
│   └── AddItems/
├── server/              # Backend (Node.js, Express, SQLite)
│   ├── routes.js        # API endpoints
│   ├── db.js            # Database connection
│   ├── server.js        # Main backend server file
│   ├── seed.js          # Initial database seeding script
│   ├── data.db          # SQLite database file
│   ├── bun.lock         # Dependency lock file
│   └── package.json     # Server dependencies
├── vite/                # Vite configurations for frontend
│   ├── Add-Customer/
│   ├── Add-Items/
│   ├── Add-Supplier/
│   ├── Home/
│   ├── Pmaster/
│   └── remove-Item/
├── commands.txt         # SQL commands for database schema
└── package.json         # Project dependencies
```

## Installation
### Prerequisites
- Bun.js (>= 1.2)
- SQLite3
- Bun package manager (for server dependencies)

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
- `GET /products` - Fetch all products
- `POST /products` - Add a new product
- `GET /suppliers` - Get supplier details
- `POST /inwards` - Add an inward stock transaction
- `POST /outwards` - Record an outward transaction

## Technologies Used
- **Frontend:** Svelte, Vite
- **Backend:** Bun.js, Express
- **Database:** SQLite
- **Package Management:** Bun

## License
"  This project, conceptualized and developed by K Jayatheerth, is undertaken in coordination with Geethanjali College of Engineering and Technology, with industry collaboration from RobotPacc."

## Contributors
- K Jayatheerth

