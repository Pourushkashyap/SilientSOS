const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // to accept large base64 audio

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
app.use(limiter);

// Routes
const alertRoutes = require('./src/routes/alert.routes');
const ngoRoutes = require('./src/routes/ngo.routes');

app.use('/api/alert', alertRoutes);
app.use('/api/ngo', ngoRoutes);

module.exports = app;
