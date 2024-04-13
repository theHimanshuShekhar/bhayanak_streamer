// Reusable interfaces

export interface RoomData {
  roomID: string;
  users: UserData[];
  createdOn: Date;
}

export interface RoomProps {
  room: RoomData;
}

export interface UserData {
  imageURL: string;
  username: string;
}

export interface Streamer {
  streamerID: string;
  username: string;
  displayURL: string;
}

export interface peerSendData {
  type: string;
  viewerPeerID: string;
  message?: string;
}

export const webRTCConfiguration: RTCConfiguration = {
  iceServers: [
    {
      urls: ["turn:144.24.127.254:3478?transport=udp"],
      username: "bhayanak",
      credential: "bhayanak",
    },
    {
      urls: ["turn:144.24.127.254:3478?transport=tcp"],
      username: "bhayanak",
      credential: "bhayanak",
    },
    { urls: ["stun:stun1.l.google.com:19302"], username: "", credential: "" },
    { urls: ["stun:stun2.l.google.com:19302"], username: "", credential: "" },
    { urls: ["stun:stun3.l.google.com:19302"], username: "", credential: "" },
    { urls: ["stun:stun4.l.google.com:19302"], username: "", credential: "" },
  ],
  iceTransportPolicy: "all",
  iceCandidatePoolSize: 10,
};
