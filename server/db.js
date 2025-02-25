import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the SQLite database
const dbPromise = open({
    filename: './data.db',  // This matches your file structure
    driver: sqlite3.Database
});

// Fetch stock overview
export async function getStockOverview() {
    const db = await dbPromise;
    return db.get(`
        SELECT COUNT(*) AS total_items,
               SUM(CASE WHEN qty < minstock THEN 1 ELSE 0 END) AS low_stock,
               SUM(CASE 
                   WHEN expiry IS NOT NULL 
                   AND DATE(SUBSTR(expiry, 7, 4) || '-' || SUBSTR(expiry, 1, 2) || '-' || SUBSTR(expiry, 4, 2)) < DATE('now') 
                   THEN 1 
                   ELSE 0 
               END) AS expired_items
        FROM pmaster
    `);
}

// Fetch sales summary
export async function getSalesSummary() {
    const db = await dbPromise;
    return db.get(`
        SELECT SUM(salevalue) AS total_sales, 
               SUM(profits) AS total_profits, 
               AVG(profitpercentage) AS avg_profit_margin
        FROM outwards
    `);
}

// Fetch top-selling items
export async function getTopSellingItems() {
    const db = await dbPromise;
    return db.all(`
        SELECT itemcode, SUM(issueqty) AS total_sold
        FROM outwards
        GROUP BY itemcode
        ORDER BY total_sold DESC
        LIMIT 5
    `);
}

// Fetch recent inventory movements
export async function getRecentMovements() {
    const db = await dbPromise;
    return db.all(`
        SELECT itemcode, 'INWARD' AS type, acceptqty AS qty, datetime('now') AS date
        FROM indwards
        UNION ALL
        SELECT itemcode, 'OUTWARD' AS type, issueqty AS qty, datetime('now') AS date
        FROM outwards
        ORDER BY date DESC
        LIMIT 10
    `);
}
