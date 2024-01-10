import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ModeToggle } from "@/components/ui/modeToggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function NavBar() {
  return (
    <>
      <nav>
        <div className="flex flex-col sm:flex-row items-center justify-between py-4">
          <a href="#" className="flex items-center grow space-x-1 md:space-x-3">
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

          <div className="flex gap-2">
            <SignedIn>
              {/* Mount the UserButton component */}
              <UserButton showName />
            </SignedIn>
            <SignedOut>
              {/* Signed out users get sign in button */}
              <SignInButton />
            </SignedOut>
          </div>
        </div>
      </nav>
    </>
  );
}
