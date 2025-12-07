interface user {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: {
    url: string;
    public_id: string;
  };
  bio?: string;
  username: string;
  website?: { text: string; url: string };
}

export type { user };
