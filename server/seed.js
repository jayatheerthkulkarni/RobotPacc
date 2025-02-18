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

// Run the function to clear tables
clearTables();

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
