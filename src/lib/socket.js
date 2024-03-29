import { io } from "socket.io-client";

const getSocket = (websocket_server_path) => {
  const socket = io(websocket_server_path, { autoConnect: false });
  return socket;
};

export default getSocket;
