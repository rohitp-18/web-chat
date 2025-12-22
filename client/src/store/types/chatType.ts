import { sGroup } from "./groupType";
import { user } from "./userType";

interface Message {
  _id: string;
  sender: user;
  content: string;
  chat: chat;
  read: string[];
  parentMessage?: Message;
  isDeleted: boolean;
  users: string[];
  deletedContent?: string;
  isInfoMessage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface chat {
  _id: string;
  chatName: string;
  isGroup: boolean;
  users: user[];
  latestMessage?: Message;
  createdAt: Date;
  avatar?: {
    url: string;
    public_id: string;
  };
  group: sGroup | null;
  chatUsername: string;
  oldUsers: string[];
  about?: string;
  updatedAt: Date;
  blockedBy: user | null;
  blockedAt: Date | null;
  blockedChat: boolean;
}

export type { chat, Message };
