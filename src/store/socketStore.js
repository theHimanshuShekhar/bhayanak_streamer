"use client";

import { io } from "socket.io-client";
import { create } from "zustand";

export const useSocketStore = create((set) => ({
  socket: io("https://websocket_streamer.bhayanak.net", {
    autoConnect: true,
  }),
}));
