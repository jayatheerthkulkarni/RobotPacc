// server.js
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

// __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = 5000;

// Define the directory for static files
const directory = path.join(__dirname, '../client');
// Middleware
app.use(express.json());
app.use(express.static(directory));
app.use(cors());

// Connect to the database
let db;
(async () => {
    try {
        db = await open({
            filename: path.resolve(__dirname, '../data.db'),
            driver: sqlite3.Database,
        });
        console.log('Connected to the SQLite database.');

        // Ensure tables exist (and customer table is created if not)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS pmaster (
                itemcode VARCHAR(30) PRIMARY KEY,
                itemname VARCHAR(100),
                itemdesc TEXT,
                itemused VARCHAR(45),
                qty INT,
                dtpur DATE,
                expiry DATE,
                avgcost INT,
                minstock INT,
                maxstock INT,
                latestprice INT,
                lowest INT,
                highest INT
            );

            CREATE TABLE IF NOT EXISTS suppliers (
                itemcode VARCHAR(30),
                supid VARCHAR(30),
                supname VARCHAR(50),
                contactperson VARCHAR(100),
                phone VARCHAR(20),
                email VARCHAR(100),
                address TEXT,
                notes TEXT,
                PRIMARY KEY (itemcode, supid),
                FOREIGN KEY (itemcode) REFERENCES pmaster(itemcode)
            );

            CREATE TABLE IF NOT EXISTS customer (
                cid VARCHAR(30) PRIMARY KEY,
                cname VARCHAR(100),
                number VARCHAR(10)
            );

            CREATE TABLE IF NOT EXISTS indwards (
                itemcode VARCHAR(30),
                supid VARCHAR(30),
                uuidin VARCHAR(30) PRIMARY KEY,
                buildqty INT,
                reciveqty INT,
                acceptqty INT,
                rejectqty INT,
                yearmanufactor INT,
                FOREIGN KEY (itemcode) REFERENCES pmaster(itemcode),
                FOREIGN KEY (supid) REFERENCES suppliers(supid)
            );

            CREATE TABLE IF NOT EXISTS outwards (
                itemcode VARCHAR(30),
                cid VARCHAR(30),
                uuidout VARCHAR(30) PRIMARY KEY,
                referece TEXT,
                issueqty INT,
                salevalue INT,
                partsavgtot INT,
                profits INT,
                profitpercentage INT,
                FOREIGN KEY (itemcode) REFERENCES pmaster(itemcode),
                FOREIGN KEY (cid) REFERENCES customer(cid)
            );
        `);

        console.log('Database tables checked/created.');

    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit the process with failure
    }
})();

// ---------------------------------------
//           Existing Endpoints
// ---------------------------------------

// 1. Total profits
app.get('/profits-total', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized.' });
        }

        const row = await db.get('SELECT SUM(profits) AS totalProfits FROM outwards');
        const totalProfits = row.totalProfits !== null ? row.totalProfits : 0;
        res.json({ totalProfits });
    } catch (error) {
        console.error('Error fetching total profits:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Low stock items
app.get('/low-stock-items', async (req, res) => {
    try {
        const items = await db.all('SELECT * FROM pmaster WHERE qty < minstock');
        res.json({ lowStockItems: items });
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        res.status(500).json({ error: 'Failed to fetch low stock items' });
    }
});

// 3. Average cost
app.get('/avg-cost', async (req, res) => {
    try {
        const row = await db.get('SELECT AVG(avgcost) AS avgCost FROM pmaster');
        const avgCost = row.avgCost !== null ? row.avgCost : 0;
        res.json({ avgCost });
    } catch (error) {
        console.error('Error fetching average cost:', error);
        res.status(500).json({ error: 'Failed to fetch average cost' });
    }
});

// 4. Health check
app.get('/health', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ status: 'error', message: 'Database not connected' });
        await db.get('SELECT 1');
        res.json({ status: 'success', message: 'Server and database are operational' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Health check failed' });
    }
});

// Home
app.get("/", (req, res) => {
    res.sendFile(directory + "/Home/index.html");
});

// AddItems
app.get("/additems", (req, res) => {
    res.sendFile(directory + "/AddItems/index.html");
});

// Server to add a route to /add-item
app.get("/add-items", (req, res)=>{
    res.sendFile(directory+"/Add-Item/index.html");
});
// Server to add a route to /add-suppliers
app.get("/add-suppliers", (req, res)=>{
    res.sendFile(directory+"/Add-Suppliers/index.html");
});

// Server to add a route to /add-customers
app.get("/add-customers", (req, res)=>{
    res.sendFile(directory+"/Add-Customer/index.html");
});


// ---------------------------------------
//        POST Endpoint to Add Supplier (Modified for 'suppliers' table with new columns)
// ---------------------------------------
app.post('/suppliers', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized.' });
        }

        const {
            suppliercode, // This will be used as supid in the 'suppliers' table
            suppliername, // This will be used as supname in the 'suppliers' table
            contactperson,
            phone,
            email,
            address,
            notes
        } = req.body;


        const itemcode = 'DEFAULT_ITEM_CODE'; // You might want to handle itemcode differently

        // Insert the new supplier into the 'suppliers' table
        const sql = `
            INSERT INTO suppliers (
                itemcode, supid, supname, contactperson, phone, email, address, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.run(sql, [
            itemcode,
            suppliercode,
            suppliername,
            contactperson,
            phone,
            email,
            address,
            notes
        ]);

        res.status(200).json({ message: 'Supplier added successfully' });
    } catch (error) {
        console.error('Error adding supplier:', error);
        res.status(500).json({ error: 'Failed to add supplier' });
    }
});


// ---------------------------------------
//        POST Endpoint to Add Customer
// ---------------------------------------
app.post('/customers', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized.' });
        }

        const {
            customerid, // This will be used as cid in the 'customer' table
            customername, // This will be used as cname in the 'customer' table
            customernumber // This will be used as number in the 'customer' table
        } = req.body;

        // Insert the new customer into the 'customer' table
        const sql = `
            INSERT INTO customer (
                cid, cname, number
            ) VALUES (?, ?, ?)
        `;
        await db.run(sql, [
            customerid,
            customername,
            customernumber
        ]);

        res.status(200).json({ message: 'Customer added successfully' });
    } catch (error) {
        console.error('Error adding customer:', error);
        res.status(500).json({ error: 'Failed to add customer' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Listening at port ${port}`);
    console.log(`Serving static files from ${directory}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    if (db) {
        try {
            await db.close();
            console.log('Database connection closed.');
        } catch (error) {
            console.error('Error closing the database connection:', error);
        }
    }
    process.exit(0);
});