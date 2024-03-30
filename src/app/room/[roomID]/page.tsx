"use client";

import { RoomData } from "@/lib/interfaces";
import { useSocketStore } from "@/store/socketStore";
import { useParams } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

export default function RoomComponent() {
  // grab socket from zustand socket store
  const websocket = useSocketStore((state) => state.socket);

  const params = useParams();

  const [roomID] = useState<string | null>(
    typeof params.roomID === "string" ? params.roomID : null
  );
  const [roomData, setRoomData] = useState<RoomData>();

  useEffect(() => {
    // Explicitly connect to websocket server as autoconnect is turned off
    if (!websocket.connected) websocket.connect();

    websocket.emit("joinRoom", roomID);

    websocket.on("roomData", (roomData: SetStateAction<RoomData | undefined>) =>
      setRoomData(roomData)
    );

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
