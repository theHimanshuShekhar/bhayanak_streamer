"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useSocketStore } from "@/store/socketStore";
import { VideoPlayer } from "./streamVideoPlayer";
import { useUser } from "@clerk/nextjs";
import { peerSendData, webRTCConfiguration } from "@/lib/interfaces";
import { Peer, type DataConnection } from "peerjs";

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
  let [captureStream, setCaptureStream] = useState<MediaStream>();

  const { user, isLoaded, isSignedIn } = useUser();

  // const [viewers, setViewers] = useState<string[]>([]);

  // grab socket from zustand socket store
  const websocket = useSocketStore((state) => state.socket);

  async function startCapture() {
    if (!isLoaded || !isSignedIn) return;
    try {
      setCaptureStream(
        await navigator.mediaDevices.getDisplayMedia(captureOptions)
      );
    } catch (error) {
      console.error(error);
      setCaptureStream(undefined);

      stopCapture();
    }

    websocket.emit("startStream", {
      roomID: props.roomID,
      username: user?.fullName,
      displayURL: user?.imageUrl,
    });
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

  let connectionRef = useRef<DataConnection>();

  useEffect(() => {
    if (!websocket.connected) websocket.connect();

    if (!websocket.id) return;

    if (!captureStream) return;

    let streamerPeer = new Peer(websocket.id, {
      config: webRTCConfiguration,
      host: "localhost",
      port: 9000,
      path: "/PeerServer",
    });

    streamerPeer.on("open", (id) =>
      console.log(`streamerPeer created with id: ${id}`)
    );

    streamerPeer.on("connection", (connection) => {
      console.log("Connection Open", connection);

      const onDataReceived = (data: peerSendData) => {
        if (!data || !data.type) return;
        if (data.type === "handshake") {
          console.log(data.message, data.viewerPeerID);
        }

        if (data.type === "requestForStream") {
          console.log(
            "Call ViewerPeer with stream",
            captureStream,
            captureStream.getTracks()
          );
          streamerPeer.call(data.viewerPeerID, captureStream);
        }
      };

      connection.on("data", onDataReceived as (data: unknown) => void);

      connection.on("open", () => {
        console.log("Connection established to ViewerPeer", connection);
        connection.send({
          type: "handshake",
          viewerPeerID: websocket.id,
          message: "Handshake from StreamerPeer",
        });
      });

      connectionRef.current = connection;
    });

    return () => {
      streamerPeer.disconnect();
      streamerPeer.destroy();
      connectionRef.current?.close();
      websocket.disconnect();
    };
  }, [captureStream, websocket]);

  return (
    <>
      {/* Only show on your own client */}
      <div className="flex justify-between items-center border-2 rounded-lg p-1 px-2 w-full max-w-full bg-gray-900">
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
        <div className="border-2 rounded-lg bg-gray-900 font-semibold">
          <div className="p-1 text-red-700 uppercase">Stream Preview</div>
          <VideoPlayer stream={captureStream} />
        </div>
      )}
    </>
  );
}
