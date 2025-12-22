import { user } from "./userType";

interface sGroup {
  _id: string;
  name: string;
  username: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  chat: string;
  about?: string;
  admins: string[];
  members: string[];
  createdBy: Date;
  blockedMembers: string[];
  userBlocked: string[];
}

interface Group {
  _id: string;
  name: string;
  username: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  about?: string;
  chat: string;
  admins: user[];
  members: user[];
  createdBy: Date;
  blockedMembers: user[];
  userBlocked: user[];
}

export type { Group, sGroup };
