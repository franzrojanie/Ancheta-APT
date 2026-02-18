const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const { pool } = require('../backend/config/database');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ancheta-apartment-frontend.onrender.com',
    'https://anchetasapartment.vercel.app',
    process.env.FRONTEND_URL
  ].filter(url => url),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/users', require('../backend/routes/users'));
app.use('/api/units', require('../backend/routes/units'));
app.use('/api/tenants', require('../backend/routes/tenants'));
app.use('/api/bills', require('../backend/routes/bills'));
app.use('/api/payments', require('../backend/routes/payments'));
app.use('/api/maintenance', require('../backend/routes/maintenance'));
app.use('/api/dashboard', require('../backend/routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ancheta Apartment API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
