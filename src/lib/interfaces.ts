// Reusable interfaces

export interface RoomData {
  roomID: string;
  users: string[];
  createdOn: Date;
  streamer: string;
}

export interface RoomProps {
  room: RoomData;
}

export interface UserData {
  imageURL: string;
  username: string;
}
