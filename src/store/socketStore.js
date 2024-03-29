"use client";

import { io } from "socket.io-client";
import { create } from "zustand";

export const useSocketStore = create((set) => ({
  socket: io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER, {
    autoConnect: true,
  }),
}));
