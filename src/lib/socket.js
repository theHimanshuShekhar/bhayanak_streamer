
import { io } from "socket.io-client";

const getSocket = (websocket_server_path) => {
  return socket = io(websocket_server_path, {
    autoConnect: false,
  });
}

export default getSocket;

