"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoomData, UserData } from "@/lib/interfaces";
import { useSocketStore } from "@/store/socketStore";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RoomComponent() {
  // grab socket from zustand socket store
  const websocket = useSocketStore((state) => state.socket);

  const params = useParams();

  const roomID = typeof params.roomID === "string" ? params.roomID : null;

  const [roomData, setRoomData] = useState<RoomData>();

  useEffect(() => {
    if (!websocket.connected) websocket.connect();

    return () => {
      websocket.close();
    };
  }, [websocket]);

  // When websocket connection is established
  websocket.on("connect", () => {
    console.log(`Socket ${websocket.id} connected to webserver`);

    websocket.emit("joinRoom", roomID);

    websocket.on("roomData", (roomDetails: RoomData) =>
      setRoomData(roomDetails)
    );
  });

  return (
    <>
      {roomData && (
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-full overflow-y-scroll no-scrollbar flex-grow-0 flex-shrink-0 h-3/4 max-h-3/4 min-h-3/4">
            <div className="grid grid-cols-2 gap-2">
              {roomData.users.map((user, index) => (
                <UserWindow
                  user={user}
                  index={index}
                  userListLength={roomData.users.length}
                  key={index}
                />
              ))}
            </div>
          </div>
          {roomID && <ChatRoom roomID={roomID} />}
        </div>
      )}
    </>
  );
}

interface RoomMessage {
  username: string;
  imageURL: string;
  messageContent: string;
}

function ChatRoom(props: { roomID: string }) {
  const [messageText, setMessageText] = useState("");
  const { isSignedIn, user, isLoaded } = useUser();
  const [messageList, setMessageList] = useState<RoomMessage[]>([]);

  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  // grab socket from zustand socket store
  const websocket = useSocketStore((state) => state.socket);

  const sendMessage = (event: any) => {
    // Donot create room if no text in inputted
    if (messageText.length < 1) return;

    // Users are not able to create rooms if not signed in
    if (isLoaded && !isSignedIn) return;

    // Ignore input if any other key than Enter key
    if (event.code && event.code !== "Enter") return;

    if (!user || !isSignedIn || !isLoaded) return;

    websocket.emit("sendRoomMessage", {
      roomID: props.roomID,
      username: user.username,
      imageURL: user.imageUrl,
      messageContent: messageText,
    });

    setMessageText("");
  };

  websocket.on("roomMessage", (roomMessage: RoomMessage) => {
    setMessageList([...messageList, roomMessage]);
    if (bottomOfChatRef && bottomOfChatRef.current)
      bottomOfChatRef.current.scrollIntoView();
  });

  return (
    <div className="rounded-lg flex-grow flex-shrink-0 h-1/4 max-h-1/4 min-h-1/4">
      <div className="flex flex-col h-full border-2 rounded-lg min-h-full">
        <div className="border rounded-lg p-2 py-3 text-center text-lg lg:text-xl font-semibold text-ellipsis overflow-hidden">
          {props.roomID}
        </div>
        <div className="grow px-2 h-full overflow-y-scroll no-scrollbar">
          {messageList &&
            messageList.length > 0 &&
            messageList.map((message: RoomMessage, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          <div ref={bottomOfChatRef} />
        </div>
        {user && (
          <input
            type="text"
            placeholder="Enter your message"
            className="rounded-lg p-2 m-2"
            onKeyDown={sendMessage}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setMessageText(event.target.value);
            }}
            value={messageText}
          />
        )}
      </div>
    </div>
  );
}

function UserWindow(props: {
  user: UserData;
  index: number;
  userListLength: number;
}) {
  const userData = props.user;
  const index = props.index;
  const userListLength = props.userListLength;

  const [captureStream, setCaptureStream] = useState<MediaStream>();

  const { user } = useUser();

  async function startCapture() {
    try {
      setCaptureStream(
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
          },
        })
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {userData && (
        <div
          // style={{
          //   background: `rgb(${get_average_rgb(userData.imageURL)})`,
          // }}
          className={`col-span-2 ${
            !captureStream || !captureStream.active
              ? "px-2 py-10 md:px-4 lg:px-40"
              : ""
          } border-2 rounded-lg text-center align-middle ${
            userListLength == 1 ||
            (index === userListLength - 1 && userListLength % 2 !== 0)
              ? "col-span-2"
              : "md:col-span-1"
          }`}
        >
          <div className="flex flex-col w-ful h-full justify-center items-center capitalize gap-1">
            {(!captureStream || !captureStream.active) && (
              <Avatar className="rounded-full h-24 w-24 border-4 border-purple-500">
                <AvatarImage
                  className="rounded-full overflow-hidden"
                  src={userData.imageURL}
                  alt={userData.username}
                  sizes="lg"
                />
                <AvatarFallback>{userData.username}</AvatarFallback>
              </Avatar>
            )}

            {(!captureStream || !captureStream.active) &&
              user &&
              user.username === userData.username && (
                <>
                  <div className="text-md">{userData.username}</div>
                  <Button className="my-1" onClick={startCapture}>
                    Stream
                  </Button>
                </>
              )}

            {captureStream && captureStream.active && (
              <VideoPlayer stream={captureStream} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function VideoPlayer(props: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Bind MediaSource to video element
    if (props.stream && videoRef.current) {
      videoRef.current.srcObject = props.stream;
    }
  }, [props.stream]);

  return (
    <video ref={videoRef} autoPlay controls className="w-full rounded-lg" />
  );
}

function ChatMessage(props: { message: RoomMessage }) {
  return (
    <div className="flex text-sm items-center gap-1 py-1 text-wrap overflow-clip">
      <Avatar className="rounded-full h-5 w-5 border-2 border-purple-500">
        <AvatarImage
          className="rounded-full overflow-hidden"
          src={props.message.imageURL}
          alt={props.message.username}
          sizes="lg"
        />
        <AvatarFallback>{props.message.username}</AvatarFallback>
      </Avatar>

      <div className="font-bold capitalize">{props.message.username}</div>
      {props.message.messageContent}
    </div>
  );
}

function get_average_rgb(src: string) {
  let context = document.createElement("canvas").getContext("2d");
  context!.imageSmoothingEnabled = true;

  let img = new Image();
  img.src = src;
  img.crossOrigin = "";

  context!.drawImage(img, 0, 0, 1, 1);
  const final_color = context!
    .getImageData(0, 0, 1, 1)
    .data.slice(0, 3)
    .join(",");
  return final_color;
}
