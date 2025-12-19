interface user {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  about?: string;
  username: string;
  website?: { text: string; url: string };
  createdAt: Date;
}

export type { user };
