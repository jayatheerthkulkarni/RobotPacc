const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (or create if it doesn't exist)
const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

// List of tables to be cleared
const tables = ['pmaster', 'suppliers', 'customer', 'indwards', 'outwards'];

// Function to clear all data from the tables
function clearTables() {
    db.serialize(() => {
        tables.forEach((table) => {
            db.run(`DELETE FROM ${table};`, (err) => {
                if (err) {
                    console.error(`Error clearing table ${table}:`, err.message);
                } else {
                    console.log(`Table ${table} cleared successfully.`);
                }
            });
        });
    });
}

// Function to seed the database with initial data (after clearing)
function seedDatabase() {
    db.serialize(() => {
        // Example seeding for 'pmaster' table
        db.run(`INSERT INTO pmaster (itemcode, itemname, unitprice) VALUES ('ITEM001', 'Product A', 10.00);`, (err) => {
            if (err) {
                console.error('Error seeding pmaster table:', err.message);
            } else {
                console.log('pmaster table seeded.');
            }
        });

        // Example seeding for 'suppliers' table
        db.run(`INSERT INTO suppliers (phone, companyname, address) VALUES ('123-456-7890', 'Supplier Co.', '123 Main St');`, (err) => {
            if (err) {
                console.error('Error seeding suppliers table:', err.message);
            } else {
                console.log('suppliers table seeded.');
            }
        });

        // Example seeding for 'customer' table
        db.run(`INSERT INTO customer (phone, customername, address) VALUES ('987-654-3210', 'Customer Inc.', '456 Elm St');`, (err) => {
            if (err) {
                console.error('Error seeding customer table:', err.message);
            } else {
                console.log('customer table seeded.');
            }
        });

        // Example seeding for 'indwards' table (important to include the new 'additionalprice' column)
        db.run(`INSERT INTO indwards (itemcode, phone, uuidin, buildqty, reciveqty, acceptqty, rejectqty, yearmanufactor, additionalprice) VALUES ('ITEM001', '123-456-7890', 'UUID123', 100, 100, 90, 10, 2024, 5.00);`, (err) => {
            if (err) {
                console.error('Error seeding indwards table:', err.message);
            } else {
                console.log('indwards table seeded.');
            }
        });

        // Example seeding for 'outwards' table
        db.run(`INSERT INTO outwards (itemcode, phone, uuidout, outqty, yearmanufactor) VALUES ('ITEM001', '987-654-3210', 'UUID456', 50, 2024);`, (err) => {
            if (err) {
                console.error('Error seeding outwards table:', err.message);
            } else {
                console.log('outwards table seeded.');
            }
        });
    });
}

function cleanAllTables() {
    db.serialize(() => {
        tables.forEach((table) => {
            db.run(`DELETE FROM ${table};`, (err) => {
                if (err) {
                    console.error(`Error cleaning table ${table}:`, err.message);
                } else {
                    console.log(`Table ${table} cleaned successfully.`);
                }
            });
        });
    });
}

// Run the function to clean all tables
cleanAllTables();

// Seed the database after cleaning
seedDatabase();

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});