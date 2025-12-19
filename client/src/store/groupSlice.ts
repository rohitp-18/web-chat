import handleError from "./handleError";
import { chat } from "./types/chatType";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "./axios";


const createGroup = createAsyncThunk(
  "group/createGroup",
  async ({name, users}: { name: string; users: string[] }) => {
    try {
      const {data} = await axios.post("/chat/create", {chatName: name, users, isGroup: true});
      return data;
    } catch (error: unknown) {
      handleError(error)
    }
})

const getGroupDetails = createAsyncThunk(
  "group/getGroupDetails",
  async (groupId: string) => {
    try {
      const {data} = await axios.get(`/chat/${groupId}`);
      return data;
    }
    catch (error: unknown) {
      handleError(error)
    }
})

const leaveGroup = createAsyncThunk(



interface GroupState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  group: chat | null;
  created?: boolean;
}
const initialState: GroupState = {
  loading: false,
  error: null,
  success: false,
  message: null,
  group: null,
  created: false,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    clearGroupState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      }
      )
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.group = action.payload;
        state.success = true;
        state.message = "Group created successfully";
        state.created = true;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

  };
});

const { clearGroupState, clearErrors } = groupSlice.actions;

export { createGroup, clearGroupState, clearErrors };

export default groupSlice.reducer;
    