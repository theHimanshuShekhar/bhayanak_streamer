"use client";

import { io } from "socket.io-client";
import { create } from "zustand";

const websocket = io("http://localhost:5000/", {
  autoConnect: false,
});

export const useSocketStore = create(() => ({
  socket: websocket,
}));
