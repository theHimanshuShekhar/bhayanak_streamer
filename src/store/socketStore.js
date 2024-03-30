import { io } from "socket.io-client";
import { create } from "zustand";

const websocket = io("https://websocket_streamer.bhayanak.net", {
  autoConnect: false,
});

export const useSocketStore = create(() => ({
  socket: websocket,
}));

// When websocket connection is established
websocket.on("connect", () => {
  console.log(`Socket ${websocket.id} connected to webserver`);
});

websocket.on();
