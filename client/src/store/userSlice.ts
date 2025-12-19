import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "./axios";
import handleError from "./handleError";
import { user } from "./types/userType";

const loginUser = createAsyncThunk(
  "user/loginUser",
  async (userData: { email: string; password: string }) => {
    try {
      const { data } = await axios.post("/user/login", userData);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const registerUser = createAsyncThunk(
  "user/registerUser",
  async (userData: { name: string; email: string; password: string }) => {
    try {
      const { data } = await axios.post("/user/register", userData);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const getUserProfile = createAsyncThunk(
  "user/getUserProfile",
  async (word: string) => {
    try {
      const { data } = await axios.get(`/user/profile?username=${word}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

const getUser = createAsyncThunk("user/getUser", async () => {
  try {
    const { data } = await axios.get("/user/getuser");
    return data;
  } catch (error) {
    handleError(error);
  }
});

const findUsers = createAsyncThunk("user/findUsers", async (word: string) => {
  try {
    const { data } = await axios.get(`/user/find?search=${word}`);
    return data;
  } catch (error) {
    handleError(error);
  }
});

const logoutUser = createAsyncThunk("user/logoutUser", async () => {
  try {
    await axios.get("/user/logout");
  } catch (error) {
    handleError(error);
  }
});

const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (formData: FormData) => {
    try {
      const { data } = await axios.put("/user/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
);

interface UserState {
  profile?: user;
  user: user | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isAuthenticated?: boolean;
  searchResults?: user[];
}

const initialState: UserState = {
  user: null,
  loading: true,
  error: null,
  success: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log(action.payload, action.error);
        state.loading = false;
        state.error = action.error.message || "Internal Error";
        state.success = false;
        state.isAuthenticated = false;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Internal Error";
        state.success = false;
        state.isAuthenticated = false;
      })

      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.loading = false;
        state.success = false;
        state.isAuthenticated = false;
      })

      .addCase(findUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(findUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
        state.success = true;
      })
      .addCase(findUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Internal Error";
        state.success = false;
      })

      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload.user;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        console.log(action.error.message, action.payload);
        state.error = action.error.message || "Internal Error";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.error.message || "Internal Error";
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
        state.isAuthenticated = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Internal Error";
        state.success = false;
      });
  },
});

const { clearErrors, clearSuccess } = userSlice.actions;

export {
  loginUser,
  registerUser,
  getUser,
  findUsers,
  getUserProfile,
  clearErrors,
  clearSuccess,
  logoutUser,
  updateUserProfile,
};

export default userSlice.reducer;
