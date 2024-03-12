/* eslint-disable @next/next/no-img-element */
"use client";

import { SearchBar } from "@/components/ui/searchBar";
import { socket } from "../lib/socket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { SignedIn, useUser } from "@clerk/nextjs";
import { RoomData, RoomProps, UserData } from "@/lib/interfaces";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();

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
  function createNewRoom(event?: any) {
    // Users are not able to create rooms if not signed in
    // if (isLoaded && !isSignedIn) return;

    // Ignore input if any other key than Enter key
    if (event.key && event.key !== "Enter") return;

    // Emit createRoom event to server
    websocket.emit("createRoom", {
      roomID: searchTerm,
      streamer: socket.id,
      createdOn: new Date(),
    });

    // Clear the search input box
    setSearchTerm("");
  }

  return (
    <main className="flex flex-col items-center justify-between gap-2">
      <div className="flex flex-col md:flex-row min-w-full gap-2">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          createNewRoom={createNewRoom}
        />
        <SignedIn>
          <Button onClick={createNewRoom}>Create Room</Button>
        </SignedIn>
      </div>
      <div className="text-2xl py-0 h-10">
        {searchTerm.length > 0 && <>Searching &quot;{searchTerm}&quot;</>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 w-full">
        {roomList &&
          roomList.length > 0 &&
          roomList
            .filter((room: RoomData) => {
              if (searchTerm.length > 0)
                return room.roomID.includes(searchTerm);
              return true;
            })
            .map((room: RoomData, index) => (
              <Link
                href={{
                  pathname: "/room/" + room.roomID,
                }}
                key={index}
              >
                <RoomCard room={room} key={index} />
              </Link>
            ))}
      </div>
    </main>
  );
}

function RoomCard(props: RoomProps) {
  const room = props.room;
  return (
    <Card className="overflow-hidden text-purple-500 hover:border-4 hover:border-purple-900 hover:cursor-pointer hover:scale-110">
      <CardContent className="p-0">
        <img
          src="https://images.mid-day.com/images/images/2023/sep/andaaz1.jpg"
          alt="Thumbnail"
        />
      </CardContent>
      <CardHeader className="py-1 px-3">
        <CardTitle className="text-ellipsis overflow-hidden">
          {room.roomID}
        </CardTitle>
        <CardDescription className="items-center justify-start py-1 px-2 rounded-full flex w-full text-sm font-bold">
          {room.users.slice(0, 9).map((userID, key) => (
            <ConnectedUsersList socketID={userID} key={key} />
          ))}
        </CardDescription>
      </CardHeader>
      <CardFooter className="text-sm my-0 py-1 pb-2 px-3 flex justify-between">
        <div className="flex items-center border rounded-full p-1 px-2  bg-purple-500 text-white font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 m-0 y-0"
          >
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
          {room.users.length}
        </div>
        {room.createdOn && moment(new Date(room.createdOn)).fromNow()}
      </CardFooter>
    </Card>
  );
}

function ConnectedUsersList(props: { socketID: String }) {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    socket.emit("getUserData", props.socketID);
    socket.on("getUserData", (userData: UserData) => setUserData(userData));
  });

  return (
    <>
      {userData && (
        <Avatar className="-mx-1 rounded-full border-2 border-purple-500">
          <AvatarImage
            className="rounded-full h-8 overflow-hidden"
            src={userData.imageURL}
            alt={userData.username}
          />
          <AvatarFallback>{userData.username}</AvatarFallback>
        </Avatar>
      )}
    </>
  );
}
