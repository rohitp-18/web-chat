import { user } from "./userType";

interface Message {
  _id: string;
  sender: user;
  content: string;
  chat: chat;
  read: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface chat {
  _id: string;
  chatName: string;
  isGroup: boolean;
  users: user[];
  latestMessage?: Message;
  admin: user;
  createdAt: Date;
}

export type { chat, Message };
