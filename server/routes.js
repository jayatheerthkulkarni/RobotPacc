import express from 'express';
import {
  getStockOverview,
  getSalesSummary,
  getTopSellingItems,
  getRecentMovements
} from './db.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const router = express.Router();

// Function to open a new DB connection
async function openDB() {
  return open({
    filename: './data.db',
    driver: sqlite3.Database
  });
}

/* =========================================
 ✅ Stock Management APIs 
 ========================================= */
router.get('/stock-overview', async (req, res) => {
  try {
    const data = await getStockOverview();
    res.json(data);
  } catch (error) {
    console.error('Error in /stock-overview:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/sales-summary', async (req, res) => {
  try {
    const data = await getSalesSummary();
    res.json(data);
  } catch (error) {
    console.error('Error in /sales-summary:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/top-selling', async (req, res) => {
  try {
    const data = await getTopSellingItems();
    res.json(data);
  } catch (error) {
    console.error('Error in /top-selling:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent-movements', async (req, res) => {
  try {
    const data = await getRecentMovements();
    res.json(data);
  } catch (error) {
    console.error('Error in /recent-movements:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
 ✅ Item Management APIs 
 ========================================= */
router.post('/add-item', async (req, res) => {
  const { itemcode, itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest } = req.body;

  if (!itemcode || !itemname || !qty || !dtpur || !expiry || !avgcost) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = await openDB();
    await db.run(
      `INSERT INTO pmaster 
      (itemcode, itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemcode, itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest]
    );

    res.status(201).json({ message: "Item added successfully" });
  } catch (error) {
    console.error('Error in /add-item:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pmaster', async (req, res) => {
  try {
    const db = await openDB();
    const results = await db.all('SELECT * FROM pmaster');
    res.json(results);
  } catch (error) {
    console.error('Error in /pmaster:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/expired-items', async (req, res) => {
  try {
    const db = await openDB();
    const today = new Date().toISOString().split('T')[0];
    const expiredItems = await db.all('SELECT * FROM pmaster WHERE expiry < ?', [today]);
    res.json(expiredItems);
  } catch (error) {
    console.error('Error in /expired-items:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
 ✅ Supplier Management APIs 
 ========================================= */
 router.post('/add-supplier', async (req, res) => {
  const { phone, itemcode, supname, contactperson, email, address, notes } = req.body;

  if (!phone || !supname || !contactperson || !email || !address || !itemcode) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const db = await openDB();

    // ✅ Check if item exists in pmaster
    const itemExists = await db.get('SELECT itemcode FROM pmaster WHERE itemcode = ?', [itemcode]);
    if (!itemExists) {
      return res.status(400).json({ error: "Invalid item code. Item does not exist." });
    }

    await db.run(
      `INSERT INTO suppliers (phone, itemcode, supname, contactperson, email, address, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      [phone, itemcode, supname, contactperson, email, address, notes]
    );

    res.status(201).json({ message: "Supplier added successfully!" });
  } catch (error) {
    console.error('Error in /add-supplier:', error);
    res.status(500).json({ error: error.message });
  }
});


/* =========================================
 ✅ Customer Management APIs 
 ========================================= */
router.post('/add-customer', async (req, res) => {
  const { phone, cname } = req.body;

  if (!phone || !cname) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = await openDB();
    await db.run('INSERT INTO customer (phone, cname) VALUES (?, ?)', [phone, cname]);
    res.status(201).json({ message: "Customer added successfully" });
  } catch (error) {
    console.error('Error in /add-customer:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
 ✅ Inwards & Outwards Transactions APIs 
 ========================================= */
router.post('/add-inward', async (req, res) => {
  const { itemcode, phone, uuidin, reciveqty, acceptqty } = req.body;

  try {
    const db = await openDB();
    await db.run(`INSERT INTO indwards (itemcode, phone, uuidin, reciveqty, acceptqty) 
                  VALUES (?, ?, ?, ?, ?)`, 
                  [itemcode, phone, uuidin, reciveqty, acceptqty]);

    res.status(201).json({ message: "Stock received successfully" });
  } catch (error) {
    console.error('Error in /add-inward:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/add-outward', async (req, res) => {
  const { itemcode, phone, uuidout, issueqty, salevalue } = req.body;

  try {
    const db = await openDB();
    await db.run(`INSERT INTO outwards (itemcode, phone, uuidout, issueqty, salevalue) 
                  VALUES (?, ?, ?, ?, ?)`, 
                  [itemcode, phone, uuidout, issueqty, salevalue]);

    res.status(201).json({ message: "Stock issued successfully" });
  } catch (error) {
    console.error('Error in /add-outward:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
 ✅ Search APIs
 ========================================= */
router.get('/search-item', async (req, res) => {
  const { query } = req.query;

  try {
    const db = await openDB();
    const results = await db.all('SELECT * FROM pmaster WHERE itemname LIKE ?', [`%${query}%`]);
    res.json(results);
  } catch (error) {
    console.error('Error in /search-item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Example: /api/search-supplier
// This searches the "suppliers" table by phone or name
router.get('/search-supplier', async (req, res) => {
  const { query } = req.query;
  try {
    const db = await openDB();
    // Search by phone or supname - adjust for your table schema
    const results = await db.all(
      `SELECT * FROM suppliers
       WHERE phone LIKE ? OR supname LIKE ?`,
      [`%${query}%`, `%${query}%`]
    );
    res.json(results);
  } catch (error) {
    console.error('Error in /search-supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
