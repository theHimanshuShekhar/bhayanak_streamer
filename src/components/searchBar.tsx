"use client";

import { Input } from "@/components/ui/input";

import { KeyboardEventHandler, SetStateAction, useEffect } from "react";

// this interface will satisfy if you want to pass setValuesList directly
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<SetStateAction<string>>;
  createNewRoom: KeyboardEventHandler<HTMLInputElement>;
}

export function SearchBar(props: SearchBarProps) {
  useEffect(() => {});
  return (
    <>
      <Input
        className="grow"
        placeholder="Search or create a streaming Room"
        value={props.searchTerm}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          props.setSearchTerm(event.target.value);
        }}
        onKeyDown={props.createNewRoom}
      />
    </>
  );
}
