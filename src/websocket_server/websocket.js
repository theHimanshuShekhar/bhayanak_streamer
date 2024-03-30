const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store created room data
roomListData = [];
userData = {};

// Whenever a new socket connects
io.on("connection", async (socket) => {
  console.log(`Socket ${socket.id} connected`);

  // Get list of connected sockets
  const sockets = await io.fetchSockets();
  console.log(
    "User Connected",
    "Connected Sockets",
    sockets.map((socket) => socket.id)
  );

  // Send list of connected users to clients
  io.emit("onlineUsers", sockets.length);

  // Send list of rooms to clients
  emitRoomList();

  // Save user data in userData list
  socket.on("updateUserData", (userDetails) => {
    userData[socket.id] = userDetails;
  });

  // Whenever a socket disconnects
  socket.on("disconnect", async () => {
    console.log(`Socket ${socket.id} disconnected`);

    // Get new list of connected sockets
    const sockets = await io.fetchSockets();
    console.log(
      "User Disconnected",
      "Connected Sockets",
      sockets.map((socket) => socket.id)
    );

    // Send new list of connected users to clients
    io.emit("onlineUsers", sockets.length);

    // Remove user from userData list
    delete userData[socket.id];
  });

  // Whenever a new room is created
  socket.on("createRoom", async (roomData) => {
    // Join user socket to the createdRoom
    socket.join(roomData.roomID);

    // Put new room data in roomListData
    roomListData.push(roomData);
  });

  socket.on("joinRoom", async (roomID) => {
    // Join room with roomID
    socket.join(roomID);
  });

  socket.on("getUserData", (socketID) => {
    socket.emit("getUserData", userData[socketID]);
  });
});

// Update clients by sending new roomList whenever a room is created
io.of("/").adapter.on("create-room", () => emitRoomList());

// Update clients by sending new roomList whenever a room is joined
io.of("/").adapter.on("join-room", (room, socket) => {
  // Leave other rooms when joining current room
  leaveOtherRooms(socket, room);

  // update everyone in room
  updateRoomUsers(room);

  // Send new list of rooms to clients
  emitRoomList();
});

// Update clients by sending new roomList whenever a room is deleted
io.of("/").adapter.on("delete-room", (room) => {
  // Remove deleted room data from roomListData
  roomListData = roomListData.filter((roomData) => roomData.roomID != room);

  // Send new list of rooms to clients
  emitRoomList();
});

// Update clients by sending new roomList whenever a room is left
io.of("/").adapter.on("leave-room", (room, socket) => {
  // Donot take action if user leaves their own room
  if (room === socket) return;
  // update everyone in room
  updateRoomUsers(room);

  // Send new list of rooms to clients
  emitRoomList();
});

async function leaveOtherRooms(socketID, roomID) {
  // Get list of all rooms that socket is connected to
  const socket = io.sockets.sockets.get(socketID);

  for (let room of Array.from(socket.rooms)) {
    // Ignore user group and currently joining group
    if (room == roomID || room == socketID) continue;

    // Leave other remaining groups if any
    socket.leave(room);
  }
}

async function updateRoomUsers(roomID) {
  console.log(`updating users in room ${roomID}`);

  // Get Map of all rooms in this namespace
  const rooms = io.of("/").adapter.rooms;

  /* Extract roomData from room Map, merge with roomListData
  and make consolidated Object to send to clients */

  const room = rooms.get(roomID);

  // Return if no room
  if (!room) return;

  // merge RoomData back into roomList sent to clients
  const roomData = roomListData.filter(
    (roomData) => roomData.roomID === roomID
  )[0];

  let roomDataResponse = {
    roomID: roomID,
    users: Array.from(room),
    createdOn: roomData && roomData.createdOn ? roomData.createdOn : new Date(),
  };

  io.to(roomID).emit("roomData", roomDataResponse);
}

// Send roomList
async function emitRoomList() {
  // Get Map of all rooms in this namespace
  const rooms = io.of("/").adapter.rooms;

  // Fetch all connected sockets
  const sockets = await io.fetchSockets();

  // Map over sockets and make list of socket.id
  const socketList = sockets.map((socket) => socket.id);

  /* Extract roomData from room Map, merge with roomListData
  and make consolidated Object to send to clients */
  let roomList = [];
  for (let [roomID, usersSet] of rooms) {
    // Discard if it is user room
    if (!socketList.includes(roomID)) {
      let roomJson = {};
      roomJson["roomID"] = roomID;
      roomJson["users"] = Array.from(usersSet);

      // merge RoomData back into roomList sent to clients
      const roomData = roomListData.filter(
        (roomData) => roomData.roomID === roomID
      )[0];

      roomList.push({ ...roomJson, ...roomData });
    }
  }

  // Send consolidate roomList with roomData back to clients
  io.emit("roomList", roomList);
}

// Serve HTML file when user accesses the server from a browser
app.get("/", (req, res) => {
  res.send("<h1>Bhayanak Streamer Websocket server</h1>");
});

// Server is listening on PORT 5000
httpServer.listen(5000, () => {
  // Disconnect all dangling sockets on server start
  io.disconnectSockets();
  console.log(`Server is listening to the port ${httpServer.address().port}`);
});
