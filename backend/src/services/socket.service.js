const { Server } = require("socket.io");

let io;

module.exports = function initiateSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connecting:", socket.id);

    socket.on("join_alert_room", (deviceId) => {
      socket.join(deviceId);
      console.log(`Socket ${socket.id} joined tracking room: ${deviceId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

module.exports.getIo = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
