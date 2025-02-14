import express from 'express';
import {
  getStockOverview,
  getSalesSummary,
  getTopSellingItems,
  getRecentMovements
} from './db.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import XLSX from 'xlsx'; // npm install xlsx

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
  const { 
    itemcode, 
    phone, 
    uuidin, 
    buildqty,      // <-- add these!
    reciveqty, 
    acceptqty, 
    rejectqty,     // <-- add these!
    yearmanufactor // <-- add these!
  } = req.body;

  try {
    const db = await openDB();
    // Insert all 8 columns
    await db.run(
      `INSERT INTO indwards (
         itemcode, phone, uuidin, buildqty, reciveqty, acceptqty, rejectqty, yearmanufactor
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ itemcode, phone, uuidin, buildqty, reciveqty, acceptqty, rejectqty, yearmanufactor ]
    );

    res.status(201).json({ message: "Stock received successfully" });
  } catch (error) {
    console.error('Error in /add-inward:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/add-outward', async (req, res) => {
  const { 
    itemcode, 
    phone, 
    uuidout, 
    referece,         // <-- newly added
    issueqty, 
    salevalue, 
    partsavgtot,      // <-- newly added
    profits,          // <-- newly added
    profitpercentage  // <-- newly added
  } = req.body;

  try {
    const db = await openDB();
    // Insert ALL 9 columns
    await db.run(
      `INSERT INTO outwards (
         itemcode, phone, uuidout, referece, issueqty, 
         salevalue, partsavgtot, profits, profitpercentage
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemcode, 
        phone, 
        uuidout, 
        referece, 
        issueqty, 
        salevalue, 
        partsavgtot, 
        profits, 
        profitpercentage
      ]
    );
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

// Searches the "suppliers" table by phone or supname
router.get('/search-supplier', async (req, res) => {
  const { query } = req.query;
  try {
    const db = await openDB();
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

// Searches the "customer" table by phone or cname
router.get('/search-customer', async (req, res) => {
  const { query } = req.query;
  try {
    const db = await openDB();
    const results = await db.all(
      `SELECT phone, cname
         FROM customer
        WHERE phone LIKE ? 
           OR cname LIKE ?`,
      [`%${query}%`, `%${query}%`]
    );
    res.json(results);
  } catch (error) {
    console.error('Error in /search-customer:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
 ✅ Inwards Listing & Download APIs
 ========================================= */
// Endpoint to list inwards records
router.get('/inwardsdata', async (req, res) => {
  try {
    const db = await openDB();
    const data = await db.all('SELECT * FROM indwards');
    res.json(data);
  } catch (error) {
    console.error('Error in /inwards:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/download-inwards', async (req, res) => {
  try {
    const db = await openDB();
    let data = await db.all('SELECT * FROM indwards');

    // ✅ Debug Log to check before cleaning
    console.log("Raw Data from DB:", data);

    // ✅ Remove rows with missing required values
    data = data.filter(row => row.itemcode && row.phone && row.uuidin);

    // ✅ Ensure all fields exist and are properly formatted
    data = data.map(row => ({
      itemcode: row.itemcode || "",  // Ensuring no undefined
      phone: row.phone || "",
      uuidin: row.uuidin || "",
      buildqty: Number(row.buildqty) || 0,
      reciveqty: Number(row.reciveqty) || 0,
      acceptqty: Number(row.acceptqty) || 0,
      rejectqty: Number(row.rejectqty) || 0,
      yearmanufactor: Number(row.yearmanufactor) || 0,
    }));

    // ✅ Debug Log after cleaning
    console.log("Cleaned Data for Excel:", data);

    // ✅ Force column order to prevent extra columns
    const columns = [
      "itemcode",
      "phone",
      "uuidin",
      "buildqty",
      "reciveqty",
      "acceptqty",
      "rejectqty",
      "yearmanufactor"
    ];

    const formattedData = data.map(row => columns.map(col => row[col]));

    // ✅ Debug Log final data
    console.log("Final Excel Data:", formattedData);

    // ✅ Create an Excel workbook and sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["Item Code", "Supplier Phone", "UUID", "Build Quantity", "Received Quantity", "Accepted Quantity", "Rejected Quantity", "Year of Manufacture"], 
      ...formattedData
    ]);

    XLSX.utils.book_append_sheet(wb, ws, "Inwards");

    // ✅ Write workbook to a buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // ✅ Set headers and send response
    res.setHeader('Content-Disposition', 'attachment; filename="inwards.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Error in /download-inwards:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ✅ FIXED: Download Outwards as Excel */
router.get('/download-outwards', async (req, res) => {
  try {
    const db = await openDB();
    let data = await db.all('SELECT * FROM outwards');

    // 1️⃣ Filter out incomplete rows (e.g., missing itemcode, phone, or uuidout)
    data = data.filter(row => row.itemcode && row.phone && row.uuidout);

    // 2️⃣ Clean + ensure numeric fields
    //    Convert undefined to 0 for numeric columns
    data = data.map(row => ({
      itemcode:          row.itemcode         || "",
      phone:             row.phone            || "",
      uuidout:           row.uuidout          || "",
      referece:          row.referece         || "",   // TEXT column
      issueqty:          Number(row.issueqty) || 0,
      salevalue:         Number(row.salevalue) || 0,
      partsavgtot:       Number(row.partsavgtot) || 0,
      profits:           Number(row.profits) || 0,
      profitpercentage:  Number(row.profitpercentage) || 0,
    }));

    // 3️⃣ Force a consistent column order
    const columns = [
      "itemcode",
      "phone",
      "uuidout",
      "referece",
      "issueqty",
      "salevalue",
      "partsavgtot",
      "profits",
      "profitpercentage"
    ];

    // 4️⃣ Convert data into a 2D array
    const formattedData = data.map(row => columns.map(col => row[col]));

    // 5️⃣ Build an Excel sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "Item Code",
        "Customer Phone",
        "UUID (Out)",
        "Referece",
        "Issued Quantity",
        "Sale Value",
        "Parts Average Total",
        "Profits",
        "Profit Percentage"
      ],
      ...formattedData,
    ]);

    XLSX.utils.book_append_sheet(wb, ws, "Outwards");

    // 6️⃣ Write workbook to buffer & send to client
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', 'attachment; filename="outwards.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Error in /download-outwards:', error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
 ✅ Outwards Listing & Download APIs
 ========================================= */
// Endpoint to list outwards records
router.get('/outwardsdata', async (req, res) => {
  try {
    const db = await openDB();
    const data = await db.all('SELECT * FROM outwards');
    res.json(data);
  } catch (error) {
    console.error('Error in /outwardsdata:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/update-quantity', async (req, res) => {
  const { itemcode, qty } = req.body;

  if (!itemcode || qty === undefined) {
    return res.status(400).json({ error: "Missing item code or quantity" });
  }

  try {
    const db = await openDB();

    await db.run("UPDATE pmaster SET qty = ? WHERE itemcode = ?", [qty, itemcode]);

    res.json({ message: "Quantity updated successfully" });
  } catch (error) {
    console.error('Error in /update-quantity:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete-item/:itemcode', async (req, res) => {
  const { itemcode } = req.params;

  try {
    const db = await openDB();
    await db.run("DELETE FROM pmaster WHERE itemcode = ?", [itemcode]);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error('Error in /delete-item:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/item/:itemcode', async (req, res) => {
  const { itemcode } = req.params;

  try {
    const db = await openDB();
    const item = await db.get("SELECT * FROM pmaster WHERE itemcode = ?", [itemcode]);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error('Error in /item:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const db = await openDB();
    const customers = await db.all("SELECT * FROM customer");

    res.json(customers);
  } catch (error) {
    console.error('Error in /customers:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/suppliers', async (req, res) => {
  try {
    const db = await openDB();
    const suppliers = await db.all("SELECT * FROM suppliers");

    res.json(suppliers);
  } catch (error) {
    console.error('Error in /suppliers:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete-customer/:phone', async (req, res) => {
  const { phone } = req.params;

  try {
    const db = await openDB();
    await db.run("DELETE FROM customer WHERE phone = ?", [phone]);

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error('Error in /delete-customer:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete-supplier/:phone', async (req, res) => {
  const { phone } = req.params;

  try {
    const db = await openDB();
    await db.run("DELETE FROM suppliers WHERE phone = ?", [phone]);

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error('Error in /delete-supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an inwards record by uuidin
router.delete('/delete-inward/:uuidin', async (req, res) => {
  const { uuidin } = req.params;
  
  try {
    const db = await openDB();
    await db.run('DELETE FROM indwards WHERE uuidin = ?', [uuidin]);
    res.json({ message: "Inward record deleted successfully" });
  } catch (error) {
    console.error('Error in /delete-inward:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/update-inward/:uuidin', async (req, res) => {
  const { uuidin } = req.params;
  const { buildqty, reciveqty, acceptqty, rejectqty } = req.body;
  try {
    const db = await openDB();
    await db.run(
      `UPDATE indwards 
       SET buildqty = ?, reciveqty = ?, acceptqty = ?, rejectqty = ?
       WHERE uuidin = ?`,
      [buildqty, reciveqty, acceptqty, rejectqty, uuidin]
    );
    res.json({ message: "Inwards record updated successfully" });
  } catch (error) {
    console.error("Error in /update-inward:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete-inward/:uuidin', async (req, res) => {
  const { uuidin } = req.params;
  try {
    const db = await openDB();
    await db.run('DELETE FROM indwards WHERE uuidin = ?', [uuidin]);
    res.json({ message: "Inwards record deleted successfully" });
  } catch (error) {
    console.error('Error in /delete-inward:', error);
    res.status(500).json({ error: error.message });
  }
});


router.patch('/update-outward/:uuidout', async (req, res) => {
  const { uuidout } = req.params;
  const { issueqty, salevalue, partsavgtot, profits, profitpercentage } = req.body;
  try {
    const db = await openDB();
    await db.run(
      `UPDATE outwards 
       SET issueqty = ?, salevalue = ?, partsavgtot = ?, profits = ?, profitpercentage = ?
       WHERE uuidout = ?`,
      [issueqty, salevalue, partsavgtot, profits, profitpercentage, uuidout]
    );
    res.json({ message: "Outwards record updated successfully" });
  } catch (error) {
    console.error("Error in /update-outward:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete-outward/:uuidout', async (req, res) => {
  const { uuidout } = req.params;
  try {
    const db = await openDB();
    await db.run("DELETE FROM outwards WHERE uuidout = ?", [uuidout]);
    res.json({ message: "Outwards record deleted successfully" });
  } catch (error) {
    console.error("Error in /delete-outward:", error);
    res.status(500).json({ error: error.message });
  }
});



export default router;
