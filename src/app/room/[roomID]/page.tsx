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
        <div className="grow grid grid-cols-5 grid-rows-1 gap-4">
          <div className="col-span-5 lg:col-span-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              {roomData.users.map((user, index) => (
                <UserWindow
                  user={user}
                  index={index}
                  userListLength={roomData.users.length}
                  key={index}
                />
              ))}
            </div>
          </div>
          <div className="col-span-5 lg:col-span-1 border-2 rounded-lg">
            <div className="flex flex-col h-full">
              <div className="border rounded-lg p-2 py-3 text-center text-lg lg:text-xl font-semibold text-ellipsis overflow-hidden">
                {roomID}
              </div>
              <div className="grow px-2">chat box</div>
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
          // style={{
          //   background: `rgb(${get_average_rgb(userData.imageURL)})`,
          // }}
          className={`px-2 py-10 md:px-4 lg:px-40 border-2 rounded-lg text-center align-middle ${
            userListLength == 1 ||
            (index === userListLength - 1 && userListLength % 2 !== 0)
              ? "col-span-2"
              : ""
          }`}
        >
          <div className="flex flex-col w-full items-center capitalize">
            <Avatar className="rounded-full h-24 w-24 border-2 border-purple-500">
              <AvatarImage
                className="rounded-full overflow-hidden"
                src={userData.imageURL}
                alt={userData.username}
                sizes="lg"
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

function get_average_rgb(src: string) {
  let context = document.createElement("canvas").getContext("2d");
  context!.imageSmoothingEnabled = true;

  let img = new Image();
  img.src = src;
  img.crossOrigin = "";

  context!.drawImage(img, 0, 0, 1, 1);
  const final_color = context!
    .getImageData(0, 0, 1, 1)
    .data.slice(0, 3)
    .join(",");
  return final_color;
}
