"use client";

import { io } from "socket.io-client";
import { create } from "zustand";

const websocket = io("https://websocket_streamer.bhayanak.net", {
  autoConnect: false,
});

export const useSocketStore = create(() => ({
  socket: websocket,
}));
