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
