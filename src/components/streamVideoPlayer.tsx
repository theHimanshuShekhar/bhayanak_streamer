"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Streamer, peerSendData, webRTCConfiguration } from "@/lib/interfaces";
import { Peer, type DataConnection } from "peerjs";
import { useSocketStore } from "@/store/socketStore";

export function VideoPlayer(props: {
  stream?: MediaStream;
  streamer?: Streamer;
}) {
  const websocket = useSocketStore((state) => state.socket);

  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | undefined>(props.stream);

  let connectionRef = useRef<DataConnection>();

  let streamer = props.streamer;

  useEffect(() => {
    if (!websocket.connected) websocket.connect();

    if (!websocket.id || !streamer) return;

    let viewerPeer = new Peer(websocket.id, {
      config: webRTCConfiguration,
      host: "https://peerserver.bhayanak.net",
      port: 9000,
      path: "/PeerServer",
    });

    viewerPeer.on("open", (id) =>
      console.log(`ViewerPeer created with id: ${id}`)
    );

    let connection = viewerPeer.connect(streamer.streamerID);

    connection.on("open", () => {
      console.log("Connection established to StreamerPeer", connection);
      connection.send({
        type: "handshake",
        viewerPeerID: websocket.id,
        message: "Handshake from ViewerPeer",
      });

      const onDataReceived = (data: peerSendData) => {
        if (!data || !data.type) return;
        if (data.type === "handshake") {
          console.log(data.message, data.viewerPeerID);
        }
      };

      connection.on("data", onDataReceived as (data: unknown) => void);

      viewerPeer.on("call", (call) => {
        call.answer();
        call.on("stream", (incomingStream) => {
          setStream(incomingStream);
          if (videoRef.current && stream) videoRef.current.srcObject = stream;
        });
      });

      connectionRef.current = connection;

      return () => {
        viewerPeer.disconnect();
        viewerPeer.destroy();
        connection.close();
        websocket.disconnect();
      };
    });
  }, [stream, streamer, websocket]);

  useEffect(() => {
    // Bind MediaSource to video element
    if (stream && videoRef.current) {
      console.log("set video src to stream");
      videoRef.current.srcObject = stream;

      console.log(stream, stream.getTracks());
    }
  }, [stream]);

  async function startWatchingStream() {
    if (!streamer) return;

    console.log("Start establishing webRTC connection");

    connectionRef.current?.send({
      type: "requestForStream",
      viewerPeerID: websocket.id,
    });
  }

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
            <Button
              className="w-full"
              onClick={startWatchingStream}
              disabled={connectionRef.current !== undefined}
            >
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
          className="border-2 rounded-lg aspect-video min-w-full"
        />
      )}
    </div>
  );
}
