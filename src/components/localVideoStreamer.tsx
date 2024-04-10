import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useSocketStore } from "@/store/socketStore";
import { VideoPlayer } from "./streamVideoPlayer";

interface DisplayMediaStreamOptions {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
  selfBroswerSurface: boolean;
}

const captureOptions: DisplayMediaStreamOptions = {
  video: true,
  audio: {
    echoCancellation: false,
    autoGainControl: false,
    noiseSuppression: false,
  },
  selfBroswerSurface: false,
};

export function LocalStreamController(props: { roomID: string }) {
  const [captureStream, setCaptureStream] = useState<MediaStream>();

  // grab socket from zustand socket store
  const websocket = useSocketStore((state) => state.socket);

  async function startCapture() {
    try {
      setCaptureStream(
        await navigator.mediaDevices.getDisplayMedia(captureOptions)
      );
    } catch (error) {
      console.error(error);
    }

    websocket.emit("startStream", props.roomID);
  }

  async function stopCapture() {
    if (!captureStream) return;
    try {
      setCaptureStream(new MediaStream());
    } catch (error) {
      console.error(error);
    }

    websocket.emit("stopStream", props.roomID);
  }

  return (
    <>
      {/* Only show on your own client */}
      <div className="flex justify-between items-center border-2 rounded-lg p-1 px-2 w-full max-w-full">
        {(!captureStream || (captureStream && !captureStream.active)) && (
          <div>Start Streaming</div>
        )}
        {captureStream && captureStream.active && (
          <div className="text-red-600 font-bold flex gap-1 items-center">
            LIVE
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 fill-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        )}
        <div>
          {(!captureStream || !captureStream.active) && (
            <Button className="my-1" onClick={startCapture}>
              Start Stream
            </Button>
          )}
          {captureStream && captureStream.active && (
            <Button className="my-1 bg-red-700" onClick={stopCapture}>
              Stop Stream
            </Button>
          )}
        </div>
      </div>

      {/* If client starts streaming show local video playback here */}
      {captureStream && captureStream.active && (
        <VideoPlayer stream={captureStream} />
      )}
    </>
  );
}
