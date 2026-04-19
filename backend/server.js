require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const initiateSocket = require('./src/services/socket.service');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initiateSocket(server);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
