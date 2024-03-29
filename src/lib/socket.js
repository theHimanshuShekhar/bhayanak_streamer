
import { io } from "socket.io-client";

if (process.env.NEXT_PUBLIC_WEBSOCKET_SERVER) {
  console.log(`Connecting to ${process.env.NEXT_PUBLIC_WEBSOCKET_SERVER}`);
} else {
  console.log("cannot read process.env.NEXT_PUBLIC_WEBSOCKET_SERVER");
}

const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER, {
  autoConnect: false,
});

export default socket;

