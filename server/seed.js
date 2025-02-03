import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Function to initialize database and insert data
async function seedDatabase() {
    const db = await open({
        filename: './data.db',
        driver: sqlite3.Database
    });

    try {
        console.log("🚀 Seeding data into all tables...");

        // Insert 30 records into pmaster
        for (let i = 1; i <= 30; i++) {
            await db.run(`INSERT INTO pmaster VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                `ITEM${i.toString().padStart(3, '0')}`, 
                `Product ${i}`, 
                `Description for Product ${i}`, 
                `Usage Type ${i}`, 
                Math.floor(Math.random() * 500), 
                `2024-01-${String(i % 28 + 1).padStart(2, '0')}`, 
                `2026-12-${String(i % 28 + 1).padStart(2, '0')}`, 
                Math.floor(Math.random() * 1000), 
                10, 
                500, 
                Math.floor(Math.random() * 1000), 
                Math.floor(Math.random() * 500), 
                Math.floor(Math.random() * 1500)
            );
        }

        // Insert 30 records into suppliers
        for (let i = 1; i <= 30; i++) {
            await db.run(`INSERT INTO suppliers VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                `99988877${String(i).padStart(2, '0')}`, 
                `ITEM${i.toString().padStart(3, '0')}`, 
                `Supplier ${i}`, 
                `Contact Person ${i}`, 
                `supplier${i}@email.com`, 
                `Address for Supplier ${i}`, 
                `Notes for Supplier ${i}`
            );
        }

        // Insert 30 records into customer
        for (let i = 1; i <= 30; i++) {
            await db.run(`INSERT INTO customer VALUES (?, ?)`, 
                `55544433${String(i).padStart(2, '0')}`, 
                `Customer ${i}`
            );
        }

        // Insert 30 records into indwards
        for (let i = 1; i <= 30; i++) {
            await db.run(`INSERT INTO indwards VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                `ITEM${i.toString().padStart(3, '0')}`, 
                `99988877${String(i).padStart(2, '0')}`, 
                `UUID-IN-${i}`, 
                Math.floor(Math.random() * 500), 
                Math.floor(Math.random() * 500), 
                Math.floor(Math.random() * 500), 
                Math.floor(Math.random() * 10), 
                2024
            );
        }

        // Insert 30 records into outwards
        for (let i = 1; i <= 30; i++) {
            await db.run(`INSERT INTO outwards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                `ITEM${i.toString().padStart(3, '0')}`, 
                `55544433${String(i).padStart(2, '0')}`, 
                `UUID-OUT-${i}`, 
                `Reference ${i}`, 
                Math.floor(Math.random() * 100), 
                Math.floor(Math.random() * 10000), 
                Math.floor(Math.random() * 10000), 
                Math.floor(Math.random() * 1000), 
                Math.floor(Math.random() * 50)
            );
        }

        console.log("✅ Successfully inserted 30 records into each table!");

    } catch (error) {
        console.error("❌ Error inserting data:", error);
    } finally {
        await db.close();
    }
}

// Run the function
seedDatabase();
