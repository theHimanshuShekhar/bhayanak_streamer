const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log(`Socket ${socket.id} connected`);
  io.fetchSockets().then((sockets) => console.log(sockets.length));
  const sockets = await io.fetchSockets();
  console.log(sockets.map((socket) => socket.id));

  socket.on("disconnect", async () => {
    console.log(`Socket ${socket.id} disconnected`);
    const sockets = await io.fetchSockets();
    console.log(sockets.map((socket) => socket.id));
  });
});

httpServer.listen(5000, () => {
  console.log("Server is listening to the port 5000");
});
