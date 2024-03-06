const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

roomList = [];

io.on("connection", async (socket) => {
  console.log(`Socket ${socket.id} connected`);

  const sockets = await io.fetchSockets();
  console.log(
    "Connected Sockets",
    sockets.map((socket) => socket.id)
  );

  io.emit("onlineUsers", sockets.length);

  emitRoomList();

  socket.on("disconnect", async () => {
    console.log(`Socket ${socket.id} disconnected`);

    const sockets = await io.fetchSockets();
    console.log(
      "Connected Sockets",
      sockets.map((socket) => socket.id)
    );

    io.emit("onlineUsers", sockets.length);
  });

  socket.on("createRoom", async (roomData) => {
    console.log(roomData);
    socket.join(roomData.roomID);
    roomList.push(roomData);
  });
});

io.of("/").adapter.on("create-room", (room) => emitRoomList());

io.of("/").adapter.on("join-room", (room, id) => emitRoomList());

io.of("/").adapter.on("delete-room", (room, id) => {
  roomList = roomList.map((roomData) => roomData.roomID != room);
  emitRoomList();
});

io.of("/").adapter.on("leave-room", (room, id) => emitRoomList());

async function emitRoomList() {
  const rooms = io.of("/").adapter.rooms;

  const sockets = await io.fetchSockets();
  const socketList = sockets.map((socket) => socket.id);

  let roomList = [];
  for (let [roomID, usersSet] of rooms) {
    if (!socketList.includes(roomID)) {
      let roomJson = {};
      roomJson["roomID"] = roomID;
      roomJson["users"] = Array.from(usersSet);
      roomList.push(roomJson);
    }
  }
  io.emit("roomList", roomList);

  console.log("RoomList", roomList);
}

httpServer.listen(5000, () => {
  io.disconnectSockets();
  console.log("Server is listening to the port 5000");
});
