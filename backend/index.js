import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.send("<h1>Bhayanak Streamer WebSocket Server</h1>");
});

io.on("connection", (socket) => {
  console.log(`a user connected: ${socket.id}`);
});

server.listen(process.env.PORT, () => {
  console.log(`server running at PORT: ${process.env.PORT}`);
});
