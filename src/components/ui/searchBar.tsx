import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  return (
    <>
      <div className="flex flex-col md:flex-row min-w-full gap-2">
        <Input
          className="grow"
          placeholder="Search or create a streaming Room"
        />
        <Button>Create Room</Button>
      </div>
    </>
  );
}
