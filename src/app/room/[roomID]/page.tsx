"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoomData, UserData } from "@/lib/interfaces";
import { useSocketStore } from "@/store/socketStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

      websocket.on("roomData", (roomDetails: RoomData) =>
        setRoomData(roomDetails)
      );
    });

    return () => {
      websocket.close();
    };
  }, [roomID, websocket]);

  return (
    <>
      {roomData && (
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-5 lg:col-span-4 w-full grid grid-cols-2 gap-2">
            {roomData.users.map((user, index) => (
              <UserWindow
                user={user}
                index={index}
                userListLength={roomData.users.length}
                key={index}
              />
            ))}
          </div>
          <div className="col-span-5 lg:col-span-1 border rounded-lg">
            <div className="flex flex-col h-full">
              <div className="border rounded-lg p-2 py-3 text-center text-lg lg:text-xl font-semibold text-ellipsis overflow-hidden">
                {roomID}
              </div>
              <div className="grow">chat box</div>
              <input
                type="text"
                placeholder="Enter your message"
                className="rounded-lg p-2 m-2"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UserWindow(props: {
  user: UserData;
  index: number;
  userListLength: number;
}) {
  const userData = props.user;
  const index = props.index;
  const userListLength = props.userListLength;

  return (
    <>
      {userData && (
        <div
          // className="p-40 border rounded-lg text-center align-middle"
          className={`px-2 py-20 md:px-4 lg:p-40 border rounded-lg text-center align-middle ${
            userListLength == 1 ||
            (index === userListLength - 1 && userListLength % 2 !== 0)
              ? "col-span-2"
              : ""
          }`}
        >
          <div className="flex flex-col w-full border">
            <Avatar className="-mx-1 rounded-full border-2 border-purple-500">
              <AvatarImage
                className="rounded-full h-8 overflow-hidden"
                src={userData.imageURL}
                alt={userData.username}
              />
              <AvatarFallback>{userData.username}</AvatarFallback>
            </Avatar>
            <div className="text-md">{userData.username}</div>
          </div>
        </div>
      )}
    </>
  );
}
