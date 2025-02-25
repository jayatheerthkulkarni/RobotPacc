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

app.get('/product', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Pmaster/index.html'));
});

app.get('/product/additems', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/AddItems/index.html'));
});

app.get('/suppliers', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Suppliers/index.html'));
});

app.get('/customers', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Customer/index.html'));
});

app.get('/customers/add-customer', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/AddCust/index.html'));
});

app.get('/inwards', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/Inwards/index.html'));
});

app.get('/inwards/add-inwards', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/AddInwards/index.html'));
});

// This just listens
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
