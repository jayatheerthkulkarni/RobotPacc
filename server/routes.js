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

// Stock Overview API
router.get('/stock-overview', async (req, res) => {
  try {
    const data = await getStockOverview();
    res.json(data);
  } catch (error) {
    console.error('Error in /stock-overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sales Summary API
router.get('/sales-summary', async (req, res) => {
  try {
    const data = await getSalesSummary();
    res.json(data);
  } catch (error) {
    console.error('Error in /sales-summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top Selling Items API
router.get('/top-selling', async (req, res) => {
  try {
    const data = await getTopSellingItems();
    res.json(data);
  } catch (error) {
    console.error('Error in /top-selling:', error);
    res.status(500).json({ error: error.message });
  }
});

// Recent Inventory Movements API
router.get('/recent-movements', async (req, res) => {
  try {
    const data = await getRecentMovements();
    res.json(data);
  } catch (error) {
    console.error('Error in /recent-movements:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add Item API
router.post('/add-item', async (req, res) => {
  const {
    itemcode,
    itemname,
    itemdesc,
    itemused,
    qty,
    dtpur,
    expiry,
    avgcost,
    minstock,
    maxstock,
    latestprice,
    lowest,
    highest
  } = req.body;

  if (!itemcode || !itemname || !qty || !dtpur || !expiry || !avgcost) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = await openDB();
    await db.run(
      `INSERT INTO pmaster 
      (itemcode, itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemcode,
        itemname,
        itemdesc,
        itemused,
        qty,
        dtpur,
        expiry,
        avgcost,
        minstock,
        maxstock,
        latestprice,
        lowest,
        highest
      ]
    );

    res.status(201).json({ message: "Item added successfully" });
  } catch (error) {
    console.error('Error in /add-item:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ API to list all items
router.get('/items', async (req, res) => {
  try {
    const db = await openDB();
    const items = await db.all('SELECT * FROM pmaster');
    res.json(items);
  } catch (error) {
    console.error('Error in /items:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ API to list expired items
router.get('/expired-items', async (req, res) => {
  try {
    const db = await openDB();
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const expiredItems = await db.all('SELECT * FROM pmaster WHERE expiry < ?', [today]);
    res.json(expiredItems);
  } catch (error) {
    console.error('Error in /expired-items:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
