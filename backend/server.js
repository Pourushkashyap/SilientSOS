require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const initiateSocket = require('./src/services/socket.service');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket init
initiateSocket(server);

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB error:", err));

// Always start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Crash handlers
process.on('uncaughtException', (err) => {
  console.log("💥 Uncaught Exception:", err);
});

process.on('unhandledRejection', (err) => {
  console.log("💥 Unhandled Rejection:", err);
});