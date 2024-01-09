import { SearchBar } from "@/components/ui/searchBar";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between gap-10">
      <SearchBar />
      <div className="text-md">RoomList</div>
    </main>
  );
}
