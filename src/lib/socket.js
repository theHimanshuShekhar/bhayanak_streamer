"use client"

import { io } from "socket.io-client";

console.log(`Connecting to ${process.env.NEXT_PUBLIC_WEBSOCKET_SERVER}`)

export const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER, {
  autoConnect: false,
});
