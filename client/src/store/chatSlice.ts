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

interface ChatState {
  chats: chat[];
  chat: chat | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ChatState = {
  chats: [],
  chat: null,
  loading: false,
  error: null,
  success: false,
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
            (new Date(a.latestMessage?.createdAt || a.createdAt) as any) -
            (new Date(b.latestMessage?.createdAt || b.createdAt) as any)
        );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllChats.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.chats;
        state.success = true;
      })
      .addCase(getAllChats.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload as string;
        state.success = false;
      })

      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.push(action.payload.chat);
        state.success = true;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export default chatSlice.reducer;
const { clearErrors, clearSuccess, setChat, updateChats } = chatSlice.actions;

export {
  getAllChats,
  createGroup,
  clearErrors,
  clearSuccess,
  setChat,
  updateChats,
};
