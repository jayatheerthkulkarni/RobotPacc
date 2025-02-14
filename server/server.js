import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

app.use(cors()); // Enable CORS
app.use(express.json()); // JSON Middleware

// Mount API routes
app.use('/api', routes);

// Serve the frontend HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/Home/index.html'));
});

// Add Items menu route
app.get('/additems', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/AddItems/index.html'));
});
// Add Items Items route 
app.get('/add-items', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Add-Items/index.html'));
});
app.get('/product', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Pmaster/index.html'));
});
app.get('/add-suppliers', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Add-Suppliers/index.html'));
});
app.get('/add-customers', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Add-Customers/index.html'));
});
app.get('/inward', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Add-Inwards/index.html'));
});
app.get('/outward', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Add-Outwards/index.html'));
});

app.get('/inwards', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Inward/index.html'));
});

app.get('/outwards', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Outward/index.html'));
});

app.get('/removeitems', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/RemoveItems/index.html'));
});

// This just listens
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
