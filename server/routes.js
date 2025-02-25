import express from 'express';
import {
  getStockOverview,
  getSalesSummary,
  getTopSellingItems,
  getRecentMovements
} from './db.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import XLSX from 'xlsx';
import axios from 'axios'; // Import axios

const router = express.Router();

async function openDB() {
  return open({
    filename: './data.db',
    driver: sqlite3.Database
  });
}

/* =========================================
 ✅ Stock Management APIs
 ========================================= */
 
 /* Stock Overview API */
 router.get('/stock-overview', async (req, res) => {
   try {
     const db = await openDB();
     
     const totalItems = await db.get('SELECT COUNT(*) as total FROM pmaster');
     const lowStock = await db.get(
       'SELECT COUNT(*) as low FROM pmaster WHERE qty <= minstock AND minstock IS NOT NULL AND qty IS NOT NULL'
     );
     const expiredItems = await db.get(`
       SELECT COUNT(*) as expired FROM pmaster 
       WHERE date(substr(expiry, 7, 4) || '-' || substr(expiry, 1, 2) || '-' || substr(expiry, 4, 2)) <= ?
     `, [new Date().toISOString().split('T')[0]]);
 
     const data = {
       total_items: totalItems.total || 0,
       low_stock: lowStock.low || 0,
       expired_items: expiredItems.expired || 0
     };
 
     console.log("Stock Overview:", data);
     res.json(data);
   } catch (error) {
     console.error('Error in /stock-overview:', error.message);
     res.status(500).json({ error: error.message });
   }
 });
 
 /* Sales Summary API */
 router.get('/sales-summary', async (req, res) => {
   try {
     const db = await openDB();
     
     const salesData = await db.get(`
       SELECT 
         SUM(salevalue) as total_sales,
         SUM(profits) as total_profits,
         CASE 
           WHEN SUM(avgcost * salevalue) > 0 
           THEN (SUM(profits) / SUM(avgcost * salevalue)) * 100 
           ELSE 0 
         END as avg_profit_margin
       FROM outwards
       JOIN pmaster ON outwards.itemcode = pmaster.itemcode
     `);
 
     const data = {
       total_sales: salesData.total_sales || 0,
       total_profits: salesData.total_profits || 0,
       avg_profit_margin: salesData.avg_profit_margin || 0
     };
 
     console.log("Sales Summary:", data);
     res.json(data);
   } catch (error) {
     console.error('Error in /sales-summary:', error.message);
     res.status(500).json({ error: error.message });
   }
 });
 
 /* Top Selling Items API */
 router.get('/top-selling', async (req, res) => {
   try {
     const db = await openDB();
     
     const items = await db.all(`
       SELECT 
         itemcode,
         SUM(issueqty) as total_sold
       FROM outwards
       GROUP BY itemcode
       ORDER BY total_sold DESC
       LIMIT 5
     `);
 
     const data = items.map(item => ({
       itemcode: item.itemcode,
       total_sold: item.total_sold
     }));
 
     console.log("Top Selling Items:", data);
     res.json(data);
   } catch (error) {
     console.error('Error in /top-selling:', error.message);
     res.status(500).json({ error: error.message });
   }
 });
 
 /* Recent Inventory Movements API */
 router.get('/recent-movements', async (req, res) => {
   try {
     const db = await openDB();
     
     const movements = await db.all(`
       SELECT 
         itemcode,
         'Outward' as type,
         issueqty as qty
       FROM outwards
       ORDER BY rowid DESC
       LIMIT 5
     `);
 
     const data = movements.map(move => ({
       itemcode: move.itemcode,
       type: move.type,
       qty: move.qty
     }));
 
     console.log("Recent Movements:", data);
     res.json(data);
   } catch (error) {
     console.error('Error in /recent-movements:', error.message);
     res.status(500).json({ error: error.message });
   }
 });
 

/* =========================================
 ✅ Item Management APIs (pmaster)
 ========================================= */
router.get('/low-stock-items', async (req, res) => {
  try {
    const db = await openDB();
    const lowStockItems = await db.all(
      'SELECT * FROM pmaster WHERE qty <= minstock AND minstock IS NOT NULL AND qty IS NOT NULL'
    );
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error in /low-stock-items:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/add-item', async (req, res) => {
  const { itemcode, itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest } = req.body;

  if (!itemcode) {
      return res.status(400).json({ error: "Missing item code." });
  }
  if (!itemname) {
      return res.status(400).json({ error: "Missing item name." });
  }
  if (qty === undefined || qty === null || isNaN(Number(qty))) {
    return res.status(400).json({ error: "Quantity must be a valid number." });
  }

  if (!dtpur) {
      return res.status(400).json({ error: "Missing purchase date." });
  }
  if (!expiry) {
      return res.status(400).json({ error: "Missing expiry date." });
  }
  if (avgcost === undefined || avgcost === null || isNaN(Number(avgcost))) {
    return res.status(400).json({ error: "Average cost must be a valid number." });
  }

  try {
      const db = await openDB();
      const itemExists = await db.get('SELECT itemcode FROM pmaster WHERE itemcode = ?', [itemcode]);
      if (itemExists) {
          return res.status(409).json({ error: "Item code already exists." });
      }

      await db.run(
          `INSERT INTO pmaster 
          (itemcode, itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [itemcode, itemname, itemdesc, itemused, Number(qty), dtpur, expiry, Number(avgcost), minstock, maxstock, latestprice, lowest, highest]
      );

      res.status(201).json({ message: "Item added successfully" });
  } catch (error) {
      console.error('Error in /add-item:', error);
      res.status(500).json({ error: error.message });
  }
});

router.get('/items', async (req, res) => {
  try {
      const db = await openDB();
      const items = await db.all("SELECT itemcode, itemname FROM pmaster");
      res.json(items);
  } catch (error) {
      console.error('Error in /items:', error);
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

    const expiredItems = await db.all(`
      SELECT * FROM pmaster 
      WHERE date(substr(expiry, 7, 4) || '-' || substr(expiry, 1, 2) || '-' || substr(expiry, 4, 2)) <= ?
    `, [today]);

    res.json(expiredItems);
  } catch (error) {
    console.error('Error in /expired-items:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/update-item/:itemcode', async (req, res) => {
    const { itemcode } = req.params;
    const { itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest } = req.body;

    if (!itemname || !qty || !dtpur || !expiry || !avgcost) {
      return res.status(400).json({ error: "Missing required fields (itemname, qty, dtpur, expiry, avgcost are required)" });
    }
    try {
        const db = await openDB();
        await db.run(`
            UPDATE pmaster
            SET itemname = ?, itemdesc = ?, itemused = ?, qty = ?, dtpur = ?,
            expiry = ?, avgcost = ?, minstock = ?, maxstock = ?, latestprice = ?,
            lowest = ?, highest = ?
            WHERE itemcode = ?
        `, [itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest, itemcode]);

        res.json({ message: "Item updated successfully" });
    } catch (error) {
        console.error('Error in /update-item:', error);
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

router.get('/suppliers', async (req, res) => {
  try {
    const db = await openDB();
    const suppliers = await db.all("SELECT * FROM suppliers"); //Or "SELECT phone, supname FROM suppliers" to return less data

    res.json(suppliers);
  } catch (error) {
    console.error('Error in /suppliers:', error);
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

/* =========================================
 ✅ Inwards & Outwards Transactions APIs
 ========================================= */

/* New PATCH endpoint (unchanged from previous) */
router.patch('/update-item-quantity', async (req, res) => {
  const { itemcode, incrementQty, newPrice } = req.body;

  if (!itemcode || incrementQty === undefined) {
    return res.status(400).json({ error: "Missing item code or increment quantity." });
  }

  if (incrementQty < 0) {
    return res.status(400).json({ error: "Increment quantity cannot be negative." });
  }

  try {
    const db = await openDB();
    const item = await db.get('SELECT qty FROM pmaster WHERE itemcode = ?', [itemcode]);
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    const currentQty = item.qty || 0;
    const updatedQty = currentQty + incrementQty;

    const updateFields = newPrice !== undefined ? 'qty = ?, latestprice = ?' : 'qty = ?';
    const updateValues = newPrice !== undefined ? [updatedQty, newPrice, itemcode] : [updatedQty, itemcode];

    const result = await db.run(
      `UPDATE pmaster SET ${updateFields} WHERE itemcode = ?`,
      updateValues
    );

    if (result.changes === 0) {
      return res.status(500).json({ error: "Failed to update item quantity." });
    }

    console.log(`Updated item: ${itemcode}, newQty=${updatedQty}, newPrice=${newPrice || 'unchanged'}`);
    res.json({ message: `Item quantity updated to ${updatedQty}.` });
  } catch (error) {
    console.error('Error in /update-item-quantity:', error);
    res.status(500).json({ error: error.message });
  }
});

/* Updated /add-inward endpoint with additionalprice */
/* Updated /add-inward endpoint with additionalprice */
router.post('/add-inward', async (req, res) => {
  const {
    itemcode,
    phone,
    uuidin,
    buildqty,
    reciveqty,
    acceptqty,
    rejectqty,
    yearmanufactor,
    purchaseprice // This is now what we will insert into the additionalprice column
  } = req.body;

  // Validate required fields (allow 0)
  if (
    !itemcode || !phone || !uuidin ||
    buildqty === undefined || reciveqty === undefined ||
    acceptqty === undefined || rejectqty === undefined ||
    yearmanufactor === undefined || purchaseprice === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Convert to numbers (allow 0)
  const buildQtyNum = Number(buildqty);
  const reciveQtyNum = Number(reciveqty);
  const acceptQtyNum = Number(acceptqty);
  const rejectQtyNum = Number(rejectqty); // Can be negative
  const yearManufactorNum = Number(yearmanufactor);
  const additionalPriceNum = Number(purchaseprice); // We're storing purchaseprice into additionalPrice column


  // Validate non-negative values (except rejectqty and additionalprice)
  if (
    buildQtyNum < 0 || reciveQtyNum < 0 || acceptQtyNum < 0 || additionalPriceNum < 0
  ) {
    return res.status(400).json({ error: "Build, Received, Accepted quantities, and Purchase Price must be non-negative." });
  }

  // Validate yearmanufactor (allow 0 or valid range)
  const currentYear = new Date().getFullYear();
  if (yearManufactorNum !== 0 && (yearManufactorNum < 1900 || yearManufactorNum > currentYear + 5)) {
    return res.status(400).json({ error: `Year of manufacture must be 0 or between 1900 and ${currentYear + 5}.` });
  }

  try {
    const db = await openDB();

    // Check if itemcode exists in pmaster
    const item = await db.get('SELECT itemcode, qty, avgcost FROM pmaster WHERE itemcode = ?', [itemcode]);
    if (!item) {
      return res.status(400).json({ error: "Invalid item code. Item does not exist." });
    }

    // Check if phone exists in suppliers
    const supplierExists = await db.get('SELECT phone FROM suppliers WHERE phone = ?', [phone]);
    if (!supplierExists) {
      return res.status(400).json({ error: "Invalid supplier phone number. Supplier does not exist." });
    }

    // Check if uuidin is unique
    const uuidExists = await db.get('SELECT uuidin FROM indwards WHERE uuidin = ?', [uuidin]);
    if (uuidExists) {
      return res.status(409).json({ error: "UUID already exists." });
    }

    // Calculate new average cost
    const totalValueOld = item.qty * item.avgcost;
    const totalValueNew = acceptQtyNum * additionalPriceNum;
    const newTotalQty = item.qty + acceptQtyNum;
    const newAvgCost = (totalValueOld + totalValueNew) / newTotalQty;

    // Insert into indwards with additionalprice
    await db.run(
      `INSERT INTO indwards (itemcode, phone, uuidin, buildqty, reciveqty, acceptqty, rejectqty, yearmanufactor, additionalprice)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemcode, phone, uuidin, buildQtyNum, reciveQtyNum, acceptQtyNum, rejectQtyNum, yearManufactorNum, additionalPriceNum]
    );

     // Update pmaster with new quantity and average cost
     await db.run(
      `UPDATE pmaster SET qty = ?, avgcost = ? WHERE itemcode = ?`,
      [newTotalQty, newAvgCost, itemcode]
    );
    
    res.status(201).json({ message: "Stock received successfully and item quantity and average cost updated." });
  } catch (error) {
    console.error('Error in /add-inward:', error);
    res.status(500).json({ error: error.message });
  }
});

/* Ensure /inwardsdata returns additionalprice */
router.get('/inwardsdata', async (req, res) => {
  try {
    const db = await openDB();
    const data = await db.all('SELECT * FROM indwards');
    res.json(data);
  } catch (error) {
    console.error('Error in /inwardsdata:', error);
    res.status(500).json({ error: error.message });
  }
});



router.post('/add-outward', async (req, res) => {
  const {
    itemcode,
    phone,
    uuidout,
    referece,
    issueqty,
    salevalue,
    partsavgtot,
    price
  } = req.body;

  console.log("Received /add-outward request:", req.body);

  // Validation
  if (!itemcode || !phone || !uuidout || !issueqty || !salevalue || !price) {
    console.log("Missing required fields");
    return res.status(400).json({ error: "Missing required fields." });
  }

  const parsedIssueQty = Number(issueqty);
  const parsedSaleValue = Number(salevalue);
  const parsedPrice = Number(price);

  if (isNaN(parsedIssueQty) || isNaN(parsedSaleValue) || isNaN(parsedPrice)) {
    console.log("Invalid numeric values:", { issueqty, salevalue, price });
    return res.status(400).json({ error: "Invalid numeric values provided." });
  }

  if (parsedIssueQty <= 0 || parsedSaleValue <= 0 || parsedPrice <= 0) {
    console.log("Non-positive values detected");
    return res.status(400).json({ error: "Issue Qty, Sale Value, and Price must be positive." });
  }

  try {
    const db = await openDB();

    // Get item data
    const item = await db.get('SELECT qty, avgcost FROM pmaster WHERE itemcode = ?', [itemcode]);
    if (!item) {
      console.log("Item not found:", itemcode);
      return res.status(404).json({ error: "Item not found in pmaster." });
    }

    const currentQty = item.qty;
    const avgCost = item.avgcost;

    // Check salevalue against stock (not issueqty)
    if (parsedSaleValue > currentQty) {
      console.log("Sale Value exceeds stock:", { salevalue: parsedSaleValue, available: currentQty });
      return res.status(400).json({ error: `Sale Value (${parsedSaleValue}) must be less than available stock (${currentQty}).` });
    }

    // Calculate profits using issueqty
    const profits = Math.ceil((parsedPrice * parsedIssueQty) - (avgCost * parsedIssueQty));
    const profitpercentage = avgCost !== 0 ? Math.ceil((profits / (avgCost * parsedIssueQty)) * 100) : 0;

    console.log("Calculated:", { profits, profitpercentage });

    // Update pmaster quantity (subtract issueqty)
    const newQty = currentQty - parsedIssueQty;
    if (newQty < 0) {
      console.log("Resulting quantity would be negative:", { newQty });
      // Allow negative stock as per your requirement
    }
    await db.run('UPDATE pmaster SET qty = ? WHERE itemcode = ?', [newQty, itemcode]);

    // Insert into outwards
    await db.run(
      `INSERT INTO outwards (itemcode, phone, uuidout, referece, issueqty, salevalue, partsavgtot, profits, profitpercentage, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemcode, phone, uuidout, referece, parsedIssueQty, parsedSaleValue, partsavgtot, profits, profitpercentage, parsedPrice]
    );

    console.log("Outward entry added, new qty:", newQty);

    res.status(201).json({
      message: "Stock issued successfully. Item quantity and profits updated.",
      profits,
      profitpercentage,
      updatedQty: newQty
    });
  } catch (error) {
    console.error('Error in /add-outward:', error.message);
    res.status(500).json({ error: error.message });
  }
});
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


router.delete('/delete-inward/:uuidin', async (req, res) => {
  const { uuidin } = req.params;

  try {
    const db = await openDB();
    const result = await db.run('DELETE FROM indwards WHERE uuidin = ?', [uuidin]);

    if (result.changes > 0) {
      res.status(200).json({ message: 'Inward record deleted successfully' });
    } else {
      res.status(404).json({ error: 'Inward record not found' });
    }
  } catch (error) {
    console.error('Error in /delete-inward:', error);
    res.status(500).json({ error: error.message });
  }
});


router.delete('/delete-outward/:uuidout', async (req, res) => {
  const { uuidout } = req.params;

  try {
    const db = await openDB();
    const result = await db.run('DELETE FROM outwards WHERE uuidout = ?', [uuidout]);

    if (result.changes > 0) {
      res.status(200).json({ message: 'Outward record deleted successfully' });
    } else {
      res.status(404).json({ error: 'Outward record not found' });
    }
  } catch (error) {
    console.error('Error in /delete-outward:', error);
    res.status(500).json({ error: error.message });
  }
});

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
 ✅ Download APIs (Inwards & Outwards)
 ========================================= */
router.get('/download-inwards', async (req, res) => {
    try {
      const db = await openDB();
      let data = await db.all('SELECT * FROM indwards');

      data = data.filter(row => row.itemcode && row.phone && row.uuidin);

      data = data.map(row => ({
        itemcode: row.itemcode || "",
        phone: row.phone || "",
        uuidin: row.uuidin || "",
        buildqty: Number(row.buildqty) || 0,
        reciveqty: Number(row.reciveqty) || 0,
        acceptqty: Number(row.acceptqty) || 0,
        rejectqty: Number(row.rejectqty) || 0,
        yearmanufactor: Number(row.yearmanufactor) || 0,
        additionalprice: row.additionalprice !== null ? Number(row.additionalprice) : null  //And additional price
      }));

      const columns = [
        "itemcode",
        "phone",
        "uuidin",
        "buildqty",
        "reciveqty",
        "acceptqty",
        "rejectqty",
        "yearmanufactor",
        "additionalprice" // Add additionalprice to columns
      ];

      const formattedData = data.map(row => columns.map(col => row[col]));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["Item Code", "Supplier Phone", "UUID", "Build Quantity", "Received Quantity", "Accepted Quantity", "Rejected Quantity", "Year of Manufacture", "Additional Price"], // Update the Headers
        ...formattedData
      ]);

      XLSX.utils.book_append_sheet(wb, ws, "Inwards");
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Disposition', 'attachment; filename="inwards.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);

    } catch (error) {
      console.error('Error in /download-inwards:', error);
      res.status(500).json({ error: error.message });
    }
});

router.get('/download-outwards', async (req, res) => {
  try {
    const db = await openDB();
    let data = await db.all('SELECT * FROM outwards');

    data = data.filter(row => row.itemcode && row.phone && row.uuidout);

    data = data.map(row => ({
      itemcode:          row.itemcode         || "",
      phone:             row.phone            || "",
      uuidout:           row.uuidout          || "",
      referece:          row.referece         || "",
      issueqty:          Number(row.issueqty) || 0,
      salevalue:         Number(row.salevalue) || 0,
      partsavgtot:       Number(row.partsavgtot) || 0,
      profits:           Number(row.profits) || 0,
      profitpercentage:  Number(row.profitpercentage) || 0,
      price:           Number(row.price) || 0,
    }));

    const columns = [
      "itemcode",
      "phone",
      "uuidout",
      "referece",
      "issueqty",
      "salevalue",
      "partsavgtot",
      "profits",
      "profitpercentage",
      "price"
    ];

    const formattedData = data.map(row => columns.map(col => row[col]));
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
        "Profit Percentage",
        "Price"
      ],
      ...formattedData,
    ]);

    XLSX.utils.book_append_sheet(wb, ws, "Outwards");
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename="outwards.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Error in /download-outwards:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/update-supplier/:phone', async (req, res) => {
  const { phone } = req.params;
  const { itemcode, supname, contactperson, email, address, notes } = req.body;

  if (!supname || !contactperson || !email || !address || !itemcode) {
    return res.status(400).json({ error: "Missing required fields (supname, contactperson, email, address, itemcode are required)" });
  }

  try {
    const db = await openDB();

    const itemExists = await db.get('SELECT itemcode FROM pmaster WHERE itemcode = ?', [itemcode]);
    if (!itemExists) {
      return res.status(400).json({ error: "Invalid item code. Item does not exist." });
    }

    await db.run(
      `UPDATE suppliers 
       SET itemcode = ?, supname = ?, contactperson = ?, email = ?, address = ?, notes = ?
       WHERE phone = ?`,
      [itemcode, supname, contactperson, email, address, notes, phone]
    );

    res.json({ message: "Supplier updated successfully" });
  } catch (error) {
    console.error('Error in /update-supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/update-customer/:phone', async (req, res) => {
  const { phone } = req.params;
  const { cname } = req.body;

  if (!cname) {
    return res.status(400).json({ error: "Missing required field: cname" });
  }

  try {
    const db = await openDB();

    await db.run(
      `UPDATE customer 
       SET cname = ?
       WHERE phone = ?`,
      [cname, phone]
    );

    res.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error('Error in /update-customer:', error);
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

router.get('/inward/:uuidin', async (req, res) => {
    const { uuidin } = req.params;

    try {
        const db = await openDB();
        const inward = await db.get("SELECT * FROM indwards WHERE uuidin = ?", [uuidin]);

        if (!inward) {
            return res.status(404).json({ error: "Inward record not found" });
        }

        res.json(inward);
    } catch (error) {
        console.error('Error in /inward:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;