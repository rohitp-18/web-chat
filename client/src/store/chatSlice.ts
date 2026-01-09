/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import handleError from "./handleError";
import axios from "./axios";
import { chat } from "./types/chatType";

const getAllChats = createAsyncThunk("chat/getAllChats", async () => {
  try {
    const { data } = await axios.get("/chats/");
    return data;
  } catch (error) {
    handleError(error);
  }
});

const createChat = createAsyncThunk(
  "chat/createChat",
  async (userId: string) => {
    try {
      const { data } = await axios.post("/chats/", { userId });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const createGroup = createAsyncThunk(
  "chat/createGroup",
  async (groupData: { name: string; users: string[] }) => {
    try {
      const { data } = await axios.post("/chats/group", groupData);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const blockChat = createAsyncThunk("chat/blockChat", async (chatId: string) => {
  try {
    const { data } = await axios.put(`/chats/blockchat/`, {
      chatId,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
});

const unblockChat = createAsyncThunk(
  "chat/unblockChat",
  async (chatId: string) => {
    try {
      const { data } = await axios.put(`/chats/unblockchat/`, { chatId });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const readAllMessage = createAsyncThunk(
  "chat/readAllMessage",
  async (chatId: string) => {
    try {
      const { data } = await axios.get(`/chats/read-messages/${chatId}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

interface ChatState {
  chats: chat[];
  chat: chat | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

const initialState: ChatState = {
  chats: [],
  chat: null,
  loading: false,
  error: null,
  success: false,
  message: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    setChat: (state, action) => {
      state.chat = action.payload;
    },
    updateChats: (state, action) => {
      state.chats = state.chats
        .map((c) => {
          if (c._id == action.payload._id) {
            c.latestMessage = action.payload.message;
          }
          return c;
        })
        .sort(
          (a: chat, b: chat) =>
            (new Date(b.latestMessage?.createdAt || a.createdAt) as any) -
            (new Date(a.latestMessage?.createdAt || b.createdAt) as any)
        );
    },
    toggleBlockChat: (state, action) => {
      state.chats = state.chats.map((c) =>
        c._id === action.payload.chatId
          ? {
            ...c,
            blockedChat: action.payload.blockedBy ? true : false,
            blockedBy: action.payload.blockedBy,
          }
          : c
      );
      console.log(state.chat?._id, action.payload)
      if (state.chat && state.chat._id === action.payload.chatId) {
        state.chat = {
          ...state.chat,
          blockedChat: action.payload.blockedBy ? true : false,
          blockedBy: action.payload.blockedBy,
        };
      }
    },
    updateGroupChat: (state, action) => {
      state.chat = action.payload;
      state.chats = state.chats.map((c) => c._id === action.payload._id ? action.payload : c);
    },
    updateChatUsers: (state, action) => {
      console.log("action", action.payload)
      if (state.chat && state.chat.isGroup && state.chat.group && state.chat === action.payload._id) {
        state.chat.group.members = (action.payload.users as string[])
      }
      state.chats = state.chats.map((c) => c._id === action.payload._id && c.group ? { ...c, group: { ...c.group, members: action.payload.users as string[] } } : c)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.chats;
      })
      .addCase(getAllChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })

      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = false;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.push(action.payload.chat);
        state.message = "Group created successfully";
        state.success = true;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.message = null;
      })

      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        action.payload.created && state.chats.push(action.payload.chat);
        state.chat = action.payload.chat;
        state.success = true;
        state.message = "Chat created successfully";
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })

      .addCase(blockChat.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(blockChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = state.chats.map((c) =>
          c._id === action.payload.chat._id
            ? {
              ...c,
              blockedAt: action.payload.chat.blockedAt,
              blockedBy: action.payload.chat.blockedBy,
              blockedChat: action.payload.chat.blockedChat,
            }
            : c
        );
        if (state.chat && state.chat._id === action.payload.chat._id) {
          state.chat = {
            ...state.chat,
            blockedAt: action.payload.chat.blockedAt,
            blockedBy: action.payload.chat.blockedBy,
            blockedChat: action.payload.chat.blockedChat,
          };
        }
        state.success = true;
        state.message = "User blocked successfully";
      })
      .addCase(blockChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })

      .addCase(unblockChat.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(unblockChat.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "User unblocked successfully";
        state.chats = state.chats.map((c) =>
          c._id === action.payload.chat._id
            ? {
              ...c,
              blockedAt: null,
              blockedBy: null,
              blockedChat: false,
            }
            : c
        );
        if (state.chat && state.chat._id === action.payload.chat._id) {
          state.chat = {
            ...state.chat,
            blockedAt: null,
            blockedBy: null,
            blockedChat: false,
          };
        }
      })
      .addCase(unblockChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
        state.message = null;
      });
  },
});

export default chatSlice.reducer;
export const {
  clearErrors,
  clearSuccess,
  setChat,
  updateChats,
  toggleBlockChat,
  updateGroupChat,
  updateChatUsers
} = chatSlice.actions;

export {
  getAllChats,
  createGroup,
  createChat,
  blockChat,
  unblockChat,
  readAllMessage,
};
