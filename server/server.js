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
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit the process with failure
    }
})();

// Define endpoints
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