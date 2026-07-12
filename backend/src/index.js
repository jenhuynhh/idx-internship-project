require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/mysql');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Run a simple query to test the database connection
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const propertiesRouter = require('./routes/properties');
app.use('/api/properties', propertiesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});