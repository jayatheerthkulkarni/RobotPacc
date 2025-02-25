const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database("data.db");

db.serialize(() => {
    console.log("Inserting dummy data...");

    // Function to generate random dates in MM-DD-YYYY format
    function getRandomDate(start, end) {
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month (01-12)
        const dd = String(date.getDate()).padStart(2, '0'); // Day (01-31)
        const yyyy = date.getFullYear();
        return `${mm}-${dd}-${yyyy}`;
    }

    // Generate thousands of records
    const numRecords = 5000;

    // Insert data into pmaster
    const pmasterStmt = db.prepare(`
        INSERT INTO pmaster (itemcode, itemname, itemdesc, itemused, qty, dtpur, expiry, avgcost, minstock, maxstock, latestprice, lowest, highest)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 1; i <= numRecords; i++) {
        pmasterStmt.run(
            `ITM${i}`,
            `Item ${i}`,
            `Description ${i}`,
            `Usage ${i}`,
            Math.floor(Math.random() * 500),
            getRandomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
            getRandomDate(new Date(2025, 0, 1), new Date(2030, 11, 31)),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 1000),
            Math.floor(Math.random() * 200),
            Math.floor(Math.random() * 50),
            Math.floor(Math.random() * 500)
        );
    }
    pmasterStmt.finalize();

    // Insert data into suppliers
    const suppliersStmt = db.prepare(`
        INSERT INTO suppliers (phone, itemcode, supname, contactperson, email, address, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 1; i <= numRecords; i++) {
        suppliersStmt.run(
            `9${Math.floor(1000000000 + Math.random() * 900000000)}`, // Random 10-digit phone
            `ITM${Math.floor(Math.random() * numRecords) + 1}`,
            `Supplier ${i}`,
            `Contact Person ${i}`,
            `supplier${i}@example.com`,
            `Address ${i}`,
            `Notes ${i}`
        );
    }
    suppliersStmt.finalize();

    // Insert data into customer
    const customerStmt = db.prepare(`
        INSERT INTO customer (phone, cname)
        VALUES (?, ?)
    `);
    for (let i = 1; i <= numRecords; i++) {
        customerStmt.run(
            `9${Math.floor(1000000000 + Math.random() * 900000000)}`, // Random 10-digit phone
            `Customer ${i}`
        );
    }
    customerStmt.finalize();

    // Insert data into indwards
    const indwardsStmt = db.prepare(`
        INSERT INTO indwards (itemcode, phone, uuidin, buildqty, reciveqty, acceptqty, rejectqty, yearmanufactor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 1; i <= numRecords; i++) {
        indwardsStmt.run(
            `ITM${Math.floor(Math.random() * numRecords) + 1}`,
            `9${Math.floor(1000000000 + Math.random() * 900000000)}`,
            `UUIDIN${i}`,
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 20),
            Math.floor(Math.random() * (2024 - 2000) + 2000)
        );
    }
    indwardsStmt.finalize();

    // Insert data into outwards
    const outwardsStmt = db.prepare(`
        INSERT INTO outwards (itemcode, phone, uuidout, referece, issueqty, salevalue, partsavgtot, profits, profitpercentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 1; i <= numRecords; i++) {
        outwardsStmt.run(
            `ITM${Math.floor(Math.random() * numRecords) + 1}`,
            `9${Math.floor(1000000000 + Math.random() * 900000000)}`,
            `UUIDOUT${i}`,
            `Reference ${i}`,
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 500),
            Math.floor(Math.random() * 200),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 50)
        );
    }
    outwardsStmt.finalize();

    console.log("Data insertion completed!");
});

// Close the database after all operations
db.close();
