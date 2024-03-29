"use client";

import { RoomData } from "@/lib/interfaces";
import getSocket from "@/lib/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomComponent() {
  const params = useParams();

  // create state to store websocket
  const [websocket] = useState(getSocket(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER));
  const [roomID] = useState<string | null>(
    typeof params.roomID === "string" ? params.roomID : null
  );
  const [roomData, setRoomData] = useState<RoomData>();

  useEffect(() => {
    if(!websocket.active) websocket.connect();

    websocket.emit("joinRoom", roomID)

    websocket.on("roomData", (roomData) => setRoomData(roomData))

    return () => {
      // Explicitly disconnect from socket server on component derender
      websocket.disconnect();
    };
  }, [roomID, websocket]);

  return (
    <>
      <div className="text-9xl">{roomID}</div>
      {JSON.stringify(roomData)}
    </>
  );
}
