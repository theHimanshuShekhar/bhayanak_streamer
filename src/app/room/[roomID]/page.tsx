"use client";

import { LocalStreamController } from "@/components/localVideoStreamer";
import { VideoPlayer } from "@/components/streamVideoPlayer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoomData, UserData } from "@/lib/interfaces";
import { useSocketStore } from "@/store/socketStore";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RoomComponent() {
  // grab socket from zustand socket store
  const websocket = useSocketStore((state) => state.socket);
  const [streamers, setStreamers] = useState<string[]>([]);

  useEffect(() => console.log(streamers), [streamers]);

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

    websocket.emit("joinRoom", roomID?.replaceAll("%20", "_"));

    websocket.on("roomData", (roomDetails: RoomData) =>
      setRoomData(roomDetails)
    );
  });

  websocket.on("roomStreamStart", (streamerID) => {
    console.log(`${streamerID} started streaming`);
    setStreamers([...streamers, streamerID]);
  });

  websocket.on("roomStreamStop", (streamerID) => {
    console.log(`${streamerID} stopped streaming`);
    setStreamers(streamers.filter((streamer) => streamer !== streamerID));
  });

  return (
    <>
      {roomID && roomData && (
        <div className="flex-1 flex gap-1">
          <div className="border-2 rounded-lg w-1/6 text-center font-bold h-max pb-4">
            <div className="text-lg lg:text-xl border p-2 rounded-lg">
              Connected Users
            </div>
            <div className="p-2">
              {roomData.users.map((user, index) => (
                <UserListItem user={user} key={index} />
              ))}
            </div>
          </div>
          <div className="overflow-y-scroll no-scrollbar w-3/6 min-w-3/6 max-w-3/6 overflow-hidden flex-shrink-0 flex flex-col gap-2">
            <LocalStreamController roomID={roomID} />
            {streamers.map((streamerID) => (
              <div key={streamerID}>
                {streamerID}&apos;s Stream
                <VideoPlayer stream={new MediaStream()} />
              </div>
            ))}
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

function UserListItem(props: { user: UserData }) {
  const user = props.user;
  return (
    <div className="flex items-center gap-1 justify-center">
      <Avatar className="rounded-full h-5 w-5 border-2 border-purple-500">
        <AvatarImage
          className="rounded-full overflow-hidden"
          src={user.imageURL}
          alt={user.username}
          sizes="lg"
        />
        <AvatarFallback>{user.username}</AvatarFallback>
      </Avatar>
      <div className="font-bold capitalize text-md">{user.username}</div>
    </div>
  );
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
    <div className="w-2/6 rounded-lg">
      <div className="flex flex-col h-full border-2 rounded-lg min-h-full">
        <div className="border rounded-lg p-2 py-3 text-center text-lg lg:text-xl font-semibold text-ellipsis overflow-hidden">
          {props.roomID.replaceAll("%20", " ")}
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
