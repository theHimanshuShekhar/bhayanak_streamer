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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Store created room data
roomListData = [];
active_streamers = {};
userData = {};

// Whenever a new socket connects
io.on("connection", async (socket) => {
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

  socket.on("joinRoom", async (roomID) => {
    // Donot take action if user leaves their own room
    if (roomID === socket.id) return;

    // Join room with roomID
    socket.join(roomID);
  });

  socket.on("sendRoomMessage", (messageData) =>
    io.in(messageData.roomID).emit("roomMessage", messageData)
  );

  socket.on("startStream", ({ roomID, username, displayURL }) => {
    console.log(`${socket.id} started streaming in ${roomID}`);

    if (!active_streamers[roomID]) active_streamers[roomID] = [];

    active_streamers[roomID] = Array.from(
      new Set([
        ...active_streamers[roomID],
        { streamerID: socket.id, username: username, displayURL: displayURL },
      ])
    );

    // update everyone in room
    updateRoomUsers(roomID);
  });

  socket.on("stopStream", (roomID) => {
    console.log(`${socket.id} stopped streaming in ${roomID}`);

    if (active_streamers[roomID] === undefined) return;

    active_streamers[roomID] = active_streamers[roomID].filter(
      (streamer) => streamer.streamerID !== socket.id
    );

    // update everyone in room
    updateRoomUsers(roomID);
  });
});

// Update clients by sending new roomList whenever a room is created
io.of("/").adapter.on("create-room", (room, socket) => {
  // Donot take action if user creates their own room
  if (room === socket) return;

  roomListData.push({
    roomID: room,
    createdOn: new Date(),
  });

  // update everyone in room
  updateRoomUsers(room);

  emitRoomList();
});

// Update clients by sending new roomList whenever a room is joined
io.of("/").adapter.on("join-room", (room, socket) => {
  // Donot take action if user joins their own room
  if (room === socket || socket === undefined) return;

  // Leave other rooms when joining current room
  leaveOtherRooms(socket, room);

  // update everyone in room
  updateRoomUsers(room);

  // Send new list of rooms to clients
  emitRoomList();
});

// Update clients by sending new roomList whenever a room is left
io.of("/").adapter.on("leave-room", (room, socket) => {
  // Donot take action if user leaves their own room
  if (room === socket || socket === undefined) return;

  // update everyone in room
  updateRoomUsers(room);

  // Send new list of rooms to clients
  emitRoomList();
});

// Update clients by sending new roomList whenever a room is deleted
io.of("/").adapter.on("delete-room", (room, socket) => {
  // Donot take action if user deletes their own room
  if (room === socket || socket === undefined) return;

  // Remove deleted room data from roomListData
  roomListData = roomListData.filter((roomData) => roomData.roomID != room);

  // update everyone in room
  updateRoomUsers();

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
  await wait(2000);

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
    users: Array.from(room).map((userSocketID) => userData[userSocketID]),
    createdOn: roomData && roomData.createdOn ? roomData.createdOn : new Date(),
  };

  io.to(roomID).emit("roomData", roomDataResponse);

  // Send list of active streamers to room users
  io.to(roomID).emit("activeStreamerList", active_streamers[roomID]);
}

// Send roomList
async function emitRoomList() {
  await wait(2000);

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
      roomJson["users"] = Array.from(usersSet).map(
        (userSocketID) => userData[userSocketID]
      );

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

const { PeerServer } = require("peer");

const peerServer = PeerServer({
  port: 9000,
  path: "/PeerServer",
  allow_discovery: true,
  // proxied: true,
});
