"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SetStateAction } from "react";

// this interface will satisfy if you want to pass setValuesList directly
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<SetStateAction<string>>;
}

export function SearchBar(props: SearchBarProps) {
  function createNewRoom() {}

  return (
    <>
      <div className="flex flex-col md:flex-row min-w-full gap-2">
        <Input
          className="grow"
          placeholder="Search or create a streaming Room"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            props.setSearchTerm(event.target.value)
          }
        />
        <Button onClick={createNewRoom}>Create Room</Button>
      </div>
    </>
  );
}
