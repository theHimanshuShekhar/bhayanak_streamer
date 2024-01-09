import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/modeToggle";

export default function NavBar() {
  return (
    <>
      <nav>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="#" className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage
                src="https://images.mid-day.com/images/images/2023/sep/andaaz1.jpg"
                alt="Bhayanak Streamer"
              />
              <AvatarFallback>Bhayanak Streamer</AvatarFallback>
            </Avatar>
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Bhayanak Streamer
            </span>
          </a>

          <div className="hidden w-full md:block md:w-auto">
            <ModeToggle />
          </div>
        </div>
      </nav>
    </>
  );
}
