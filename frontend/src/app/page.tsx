"use client";
import { SearchBar } from "@/components/ui/searchBar";
import { useEffect, useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className="flex flex-col items-center justify-between gap-10">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="text-4xl">{searchTerm}</div>
      <div className="text-md">RoomList</div>
    </main>
  );
}
