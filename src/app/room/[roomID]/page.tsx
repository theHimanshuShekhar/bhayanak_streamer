"use client";

import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomComponent() {
  const params = useParams();

  // create state to store websocket
  const [websocket] = useState(socket);
  const [roomID] = useState<string | null>(
    typeof params.roomID === "string" ? params.roomID : null
  );

  useEffect(() => {
    websocket.connect();

    return () => {
      // Explicitly disconnect from socket server on component derender
      websocket.disconnect();
    };
  }, [websocket]);

  return (
    <>
      <div className="text-9xl">{roomID}</div>
    </>
  );
}
