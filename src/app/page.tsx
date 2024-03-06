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
  // create state to store websocket
  const [websocket] = useState(socket);

  /* searchTerm and setSearchTerm passed into SearchBar 
  child component to get input for createRoom */
  const [searchTerm, setSearchTerm] = useState("");

  // roomList holding roomData to populate list of available rooms
  const [roomList, setRoomList] = useState([]);

  // Run on component render/re-render
  useEffect(() => {
    // Explicitly connect to websocket server as autoconnect is turned off
    websocket.connect();

    // When websocket connection is established
    websocket.on("connect", () => {
      console.log(`Socket ${socket.id} connected to webserver`);
    });

    // Receive roomList from server
    websocket.on("roomList", (roomListResponse) =>
      // Set roomList in state
      setRoomList(roomListResponse)
    );

    return () => {
      // Explicitly disconnect from socket server on component derender
      websocket.disconnect();
    };
  }, [websocket]);

  // Send new room with details to server
  function createNewRoom() {
    websocket.emit("createRoom", {
      roomID: searchTerm,
      streamer: socket.id,
      createdOn: new Date(),
    });
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
          roomList.map((room: RoomData, index) => (
            <RoomCard room={room} key={index} />
          ))}
      </div>
    </main>
  );
}

interface RoomData {
  roomID: String;
  users: String[];
  createdOn: Date;
  streamer: String;
}

interface RoomProps {
  room: RoomData;
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
      <CardFooter>
        {room.createdOn && new Date(room.createdOn).toDateString()}
      </CardFooter>
    </Card>
  );
}
