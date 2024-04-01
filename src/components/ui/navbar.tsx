"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { UserData } from "@/lib/interfaces";
import Link from "next/link";

import { useSocketStore } from "@/store/socketStore";
import type { Socket } from "socket.io-client";

export default function NavBar() {
  const websocket: Socket = useSocketStore((state) => state.socket);

  const [onlineUsers, setOnlineUsers] = useState(0);
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    // Explicitly connect to websocket server as autoconnect is turned off
    if (!websocket.connected) websocket.connect();

    websocket.on("connect", () => {
      if (user && user.username) {
        const userData: UserData = {
          imageURL: user.imageUrl,
          username: user.username,
        };

        websocket.emit("updateUserData", userData);
      }
    });

    websocket.on("onlineUsers", (userCount: number) =>
      setOnlineUsers(userCount)
    );

    return () => {
      websocket.close();
    };
  }, [websocket, user, isSignedIn, isLoaded]);

  return (
    <>
      <nav>
        <div className="flex flex-col sm:flex-row items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-1 md:space-x-3">
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
          </Link>

          <div className="flex items-center">
            <div className="text-sm mx-4 uppercase font-bold">
              Online {onlineUsers}
            </div>
            <div className="flex gap-2 capitalize">
              <SignedIn>
                <UserButton showName />
              </SignedIn>
              <SignedOut>
                <SignInButton />
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
