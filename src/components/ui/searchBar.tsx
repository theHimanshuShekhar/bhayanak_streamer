"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SetStateAction } from "react";
import { Socket } from "socket.io-client";

// this interface will satisfy if you want to pass setValuesList directly
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<SetStateAction<string>>;
}

export function SearchBar(props: SearchBarProps) {
  return (
    <>
      <Input
        className="grow"
        placeholder="Search or create a streaming Room"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.setSearchTerm(event.target.value)
        }
      />
    </>
  );
}
