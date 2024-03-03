"use client";

import { SearchBar } from "@/components/ui/searchBar";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const socket = io("ws://localhost:5000");

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Socket ${socket.id} connected to webserver`);
    });

    return () => {
      socket.disconnect();
    };
  });

  return (
    <main className="flex flex-col items-center justify-between gap-10">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="text-4xl">{searchTerm}</div>
      <div className="text-4xl">{socket.id}</div>
      <div className="text-md">RoomList</div>
    </main>
  );
}
