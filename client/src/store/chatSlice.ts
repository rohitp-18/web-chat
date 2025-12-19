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

const leaveGroup = createAsyncThunk(
  "chat/leaveGroup",
  async (chatId: string) => {
    try {
      const { data } = await axios.put("/chats/removeuser/", {
        chatId: chatId,
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const toggleBlockGroup = createAsyncThunk(
  "chat/toggleBlockGroup",
  async ({ chatId, block }: { chatId: string; block: boolean }) => {
    try {
      const url = block ? "/chats/blockgroup/" : "/chats/unblockgroup/";
      const { data } = await axios.put(url, { chatId });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const adminBlockUserInGroup = createAsyncThunk(
  "chat/adminBlockUserInGroup",
  async (data: { chatId: string; userId: string; block: boolean }) => {
    try {
      const url = data.block
        ? "/chats/adminblockuser/"
        : "/chats/adminunblockuser/";
      const response = await axios.put(url, {
        chatId: data.chatId,
        userId: data.userId,
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
);

const getGroupDetails = createAsyncThunk(
  "chat/getGroupDetails",
  async (groupId: string) => {
    try {
      const { data } = await axios.get(`/chats/${groupId}`);
      return data;
    } catch (error: unknown) {
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
      if (state.chat && state.chat._id === action.payload.chatId) {
        state.chat = {
          ...state.chat,
          blockedChat: action.payload.blockedBy ? true : false,
          blockedBy: action.payload.blockedBy,
        };
      }
    },
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
        state.success = false;
        state.message = null;
      })

      .addCase(toggleBlockGroup.fulfilled, (state, action) => {
        state.chats = state.chats.map((c) =>
          c._id === action.payload.chat._id
            ? { ...c, blockedChatUsers: action.payload.chat.blockedChatUsers }
            : c
        );
        if (state.chat && state.chat._id === action.payload.chat._id) {
          state.chat = {
            ...state.chat,
            blockedChatUsers: action.payload.chat.blockedChatUsers,
          };
        }
        state.success = true;
        state.message = action.meta.arg.block
          ? "Group blocked successfully"
          : "Group unblocked successfully";
      })
      .addCase(toggleBlockGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(adminBlockUserInGroup.fulfilled, (state, action) => {
        state.chats = state.chats.map((c) =>
          c._id === action.payload.chat._id
            ? {
                ...c,
                blockedChatUsers: action.payload.chat.blockedChatUsers,
                adminBlockedUsers: action.payload.chat.adminBlockedUsers,
              }
            : c
        );
        if (state.chat && state.chat._id === action.payload.chat._id) {
          state.chat = {
            ...state.chat,
            blockedChatUsers: action.payload.chat.blockedChatUsers,
            adminBlockedUsers: action.payload.chat.adminBlockedUsers,
          };
        }
        state.success = true;
        state.message = action.meta.arg.block
          ? "User blocked in group successfully"
          : "User unblocked in group successfully";
      })
      .addCase(adminBlockUserInGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.chats = state.chats.map((c) =>
          c._id === action.payload.chat._id
            ? { ...c, users: action.payload.chat.users }
            : c
        );
        if (state.chat && state.chat._id === action.payload.chat._id) {
          state.chat = {
            ...state.chat,
            users: action.payload.chat.users,
          };
        }
        state.success = true;
        state.message = "Left group successfully";
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(getGroupDetails.fulfilled, (state, action) => {
        state.chat = action.payload.chat;
      })
      .addCase(getGroupDetails.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default chatSlice.reducer;
const { clearErrors, clearSuccess, setChat, updateChats, toggleBlockChat } =
  chatSlice.actions;

export {
  getAllChats,
  createGroup,
  clearErrors,
  clearSuccess,
  setChat,
  updateChats,
  createChat,
  blockChat,
  unblockChat,
  toggleBlockChat,
  leaveGroup,
  toggleBlockGroup,
  adminBlockUserInGroup,
  getGroupDetails,
};
