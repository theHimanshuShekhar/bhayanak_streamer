"use client";

import { io } from "socket.io-client";
import { create } from "zustand";

const websocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER, {
  autoConnect: false,
});

export const useSocketStore = create(() => ({
  socket: websocket,
}));
