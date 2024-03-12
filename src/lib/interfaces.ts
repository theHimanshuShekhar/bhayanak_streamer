// Reusable interfaces

export interface RoomData {
  roomID: String;
  users: String[];
  createdOn: Date;
  streamer: String;
}

export interface RoomProps {
  room: RoomData;
}

export interface UserData {
  imageURL: string;
  username: string;
}
