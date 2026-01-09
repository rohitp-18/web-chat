import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "./axios";
import handleError from "./handleError";
import { user } from "./types/userType";

const getKey = createAsyncThunk("notification/getKey", async () => {
  try {
    const { data } = await axios.get("/notifications/key");
    return data;
  } catch (error) {
    handleError(error);
  }
});

const subscribeUser = createAsyncThunk(
  "notification/subscribeUser",
  async (subscription: PushSubscription) => {
    try {
      const { data } = await axios.post("/notifications/subscribe", {
        subscription,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const unSubscribeUser = createAsyncThunk(
  "notification/unSubscribeUser",
  async (subscription: PushSubscription) => {
    try {
      const { data } = await axios.post("/notifications/unsubscribe", {
        subscription,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

interface notificationT {
  _id: string;
  recipient: string;
  sender: user;
  type: string;
  message: string;
  read: boolean;
  url: string;
  relatedId?: { avatar: { url: string }; name: string };
  createdAt: Date;
  updatedAt: Date;
  content: string;
}

interface invitationT {
  _id: string;
  sender: string;
  recipientEmail: string;
  type: string;
  status: string;
  message?: string;
  link?: string;
  targetId?: {
    _id: string;
    name?: string;
    avatar?: { url: string; public_id: string };
  };
  refModel?: string;
  createdAt: Date;
  expiresAt?: Date;
  unread?: boolean;
}

interface notificationState {
  notifications: notificationT[];
  loading: boolean;
  error: string | null;
  message: string | null;
  deleted: boolean;
  key?: string;
  totalInvitations: number;
  invitations: invitationT[];
  totalNotifications: number;
  totalChats: number;
}

const initialState: notificationState = {
  notifications: [],
  loading: false,
  error: null,
  message: null,
  deleted: false,
  invitations: [],
  totalInvitations: 0,
  totalNotifications: 0,
  totalChats: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    resetNotification: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.deleted = false;
    },
    clearError: (state) => {
      state.loading = false;
      state.error = null;
    },
    updateInvitations: (state, action) => {
      state.invitations = action.payload;
    },
    updateChatNotifications: (state, action) => {
      state.totalChats = action.payload;
    },
    updateNotificationCount: (state, action) => {
      state.totalNotifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getKey.fulfilled, (state, action) => {
      state.key = action.payload.key;
    });
  },
});

export const {
  resetNotification,
  clearError,
  updateInvitations,
  updateChatNotifications,
  updateNotificationCount,
} = notificationSlice.actions;

export { getKey, subscribeUser, unSubscribeUser };
export type { notificationT };
export default notificationSlice.reducer;
