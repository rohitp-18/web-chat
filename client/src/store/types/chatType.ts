import { user } from "./userType";

interface Message {
  _id: string;
  sender: user;
  content: string;
  chat: chat;
  read: string[];
  parentMessage?: Message;
  isDeleted: boolean;
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
  admin: user;
  createdAt: Date;
  avatar?: {
    url: string;
    public_id: string;
  };
  chatUsername: string;
  about?: string;
  updatedAt: Date;
  blockedBy: user | null;
  blockedAt: Date | null;
  blockedChatUsers: user[];
  adminBlockedUsers: user[];
  blockedChat: boolean;
}

export type { chat, Message };
