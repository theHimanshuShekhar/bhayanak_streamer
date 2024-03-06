"use client";

import { SearchBar } from "@/components/ui/searchBar";
import { socket } from "../lib/socket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [websocket] = useState(socket);
  const [roomList, setRoomList] = useState([]);

  useEffect(() => {
    websocket.connect();

    websocket.on("connect", () => {
      console.log(`Socket ${socket.id} connected to webserver`);
    });

    websocket.on("roomList", (roomListResponse) =>
      setRoomList(roomListResponse)
    );

    return () => {
      websocket.disconnect();
    };
  }, [websocket]);

  function createNewRoom() {
    console.log(websocket.id, websocket, searchTerm);
    websocket.emit("createRoom", {
      roomID: searchTerm,
      streamer: socket.id,
      createdOn: new Date(),
    });
    console.log("create room button clicked!");
  }

  return (
    <main className="flex flex-col items-center justify-between gap-10">
      <div className="flex flex-col md:flex-row min-w-full gap-2">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Button onClick={createNewRoom}>Create Room</Button>
      </div>
      <div className="text-4xl">{searchTerm}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full">
        {roomList &&
          roomList.length > 0 &&
          roomList.map((room: { roomID: String; users: String[] }, index) => (
            <RoomCard room={room} key={index} />
          ))}
      </div>
    </main>
  );
}

interface RoomProps {
  room: {
    roomID: String;
    users: String[];
  };
}

function RoomCard(props: RoomProps) {
  const room = props.room;
  console.log(room);
  return (
    <Card>
      <CardContent>
        <p>Thumbnail</p>
      </CardContent>
      <CardHeader>
        <CardTitle className="text-ellipsis overflow-hidden">
          {room.roomID}
        </CardTitle>
        <CardDescription>{room.users.length} Users</CardDescription>
      </CardHeader>
      {/* <CardFooter>
        <p>Card Footer</p>
      </CardFooter> */}
    </Card>
  );
}
