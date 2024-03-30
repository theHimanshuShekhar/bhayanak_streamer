"use client";

import { RoomData } from "@/lib/interfaces";
import { useSocketStore } from "@/store/socketStore";
import { useParams } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

export default function RoomComponent() {
  // grab socket from zustand socket store
  const websocket = useSocketStore((state) => state.socket);

  const params = useParams();

  const roomID = typeof params.roomID === "string" ? params.roomID : null;

  const [roomData, setRoomData] = useState<RoomData>();

  useEffect(() => {
    if (!websocket.connected) websocket.connect();

    // When websocket connection is established
    websocket.on("connect", () => {
      console.log(`Socket ${websocket.id} connected to webserver`);

      websocket.emit("joinRoom", roomID);

      websocket.on(
        "roomData",
        (roomData: SetStateAction<RoomData | undefined>) =>
          setRoomData(roomData)
      );
    });

    return () => {
      websocket.close();
    };
  }, [websocket, roomID]);

  return (
    <>
      <div className="text-9xl">{roomID}</div>
      {JSON.stringify(roomData)}

      {roomData &&
        roomData.users.map((user) => {
          <div>user</div>;
        })}
    </>
  );
}
