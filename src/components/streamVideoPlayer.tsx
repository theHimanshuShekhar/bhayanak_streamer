import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Streamer } from "@/lib/interfaces";

export function VideoPlayer(props: {
  stream?: MediaStream;
  streamer?: Streamer;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(
    props.stream || null
  );

  let streamer = props.streamer;

  function startWatchingStream() {
    console.log("establish webRTC connection");
    setStream(new MediaStream());
  }

  useEffect(() => {
    // Bind MediaSource to video element
    if (stream !== undefined && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full flex flex-col item-center">
      {streamer && (
        <>
          <div className="p-1 flex gap-1">
            <Avatar className="rounded-full h-6 w-6 border-2 border-purple-500">
              <AvatarImage
                className="rounded-full overflow-hidden"
                src={streamer.displayURL}
                alt={streamer.username}
              />
              <AvatarFallback>{streamer.username}</AvatarFallback>
            </Avatar>
            {streamer.username}&apos;s Stream
          </div>
          {!stream && (
            <Button className="w-full" onClick={startWatchingStream}>
              Watch Stream
            </Button>
          )}
        </>
      )}

      {stream && (
        <video
          ref={videoRef}
          autoPlay
          controls
          className="border-2 rounded-lg object-cover aspect-video min-w-full"
        />
      )}
    </div>
  );
}
