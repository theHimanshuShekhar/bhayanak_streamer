"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  function createNewRoom() {}

  return (
    <>
      <div className="flex flex-col md:flex-row min-w-full gap-2">
        <Input
          className="grow"
          placeholder="Search or create a streaming Room"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(event.target.value)
          }
        />
        <Button onClick={createNewRoom}>Create Room</Button>
      </div>

      <div className="text-4xl">{searchTerm}</div>
    </>
  );
}
