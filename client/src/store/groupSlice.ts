import handleError from "./handleError";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "./axios";
import { Group } from "./types/groupType";

const createGroup = createAsyncThunk(
  "group/createGroup",
  async (formData: FormData) => {
    try {
      const { data } = await axios.post("/group", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const getGroupDetails = createAsyncThunk(
  "group/getGroupDetails",
  async (groupId: string) => {
    try {
      const { data } = await axios.get(`/group/${groupId}`);
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const updateGroup = createAsyncThunk(
  "group/updateGroup",
  async ({ groupId, formData }: { groupId: string; formData: FormData }) => {
    try {
      const { data } = await axios.put(`/group/${groupId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const addUsersToGroup = createAsyncThunk(
  "group/addUsersToGroup",
  async ({ groupId, userIds }: { groupId: string; userIds: string[] }) => {
    try {
      const { data } = await axios.post(`/group/${groupId}/add-users`, {
        userIds,
      });
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const removeUsersFromGroup = createAsyncThunk(
  "group/removeUsersFromGroup",
  async ({ groupId, userIds }: { groupId: string; userIds: string[] }) => {
    try {
      const { data } = await axios.post(`/group/${groupId}/remove-users`, {
        userIds,
      });
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const leaveGroup = createAsyncThunk(
  "group/leaveGroup",
  async (groupId: string) => {
    try {
      const { data } = await axios.post(`/group/${groupId}/leave`);
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const adminBlockUser = createAsyncThunk(
  "group/adminBlockUser",
  async ({ groupId, userId }: { groupId: string; userId: string }) => {
    try {
      const { data } = await axios.post(`/group/${groupId}/admin/block-user`, {
        userId,
      });
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const adminUnblockUser = createAsyncThunk(
  "group/adminUnblockUser",
  async ({ groupId, userId }: { groupId: string; userId: string }) => {
    try {
      const { data } = await axios.post(
        `/group/${groupId}/admin/unblock-user`,
        {
          userId,
        }
      );
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const userBlockGroup = createAsyncThunk(
  "group/userBlockGroup",
  async (groupId: string) => {
    try {
      const { data } = await axios.post(`/group/${groupId}/user/block-group`);
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const userUnblockGroup = createAsyncThunk(
  "group/userUnblockGroup",
  async (groupId: string) => {
    try {
      const { data } = await axios.post(`/group/${groupId}/user/unblock-group`);
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

const toggleAdminStatus = createAsyncThunk(
  "group/toggleAdminStatus",
  async ({
    groupId,
    userId,
    makeAdmin,
  }: {
    groupId: string;
    userId: string;
    makeAdmin: boolean;
  }) => {
    try {
      const { data } = await axios.post(
        `/group/${groupId}/admin/toggle-admin`,
        {
          userId,
          makeAdmin,
        }
      );
      return data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
);

interface GroupState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  group: Group | null;
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
    clearErrors: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearGroupState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.group = action.payload.group;
        state.success = true;
        state.message = "Group created successfully";
        state.created = true;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })
      .addCase(getGroupDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.group = action.payload.group;
      })
      .addCase(getGroupDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      })
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.group = action.payload.group;
        state.success = true;
        state.message = "Group updated successfully";
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      })
      .addCase(addUsersToGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUsersToGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.group = action.payload.group;
        state.message = "Users added to group successfully";
      })
      .addCase(addUsersToGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })

      .addCase(removeUsersFromGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(removeUsersFromGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.group = state.group
          ? {
              ...state.group,
              members: state.group.members.filter(
                (member) => action.meta.arg.userIds.indexOf(member._id) === -1
              ),
            }
          : null;
        state.message = "Users removed from group successfully";
      })
      .addCase(removeUsersFromGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })

      .addCase(leaveGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.group = action.payload.group;
        state.message = action.payload.message;
        state.group = null;
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })
      .addCase(adminBlockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(adminBlockUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const member = state.group?.members.find(
          (m) => m._id === action.meta.arg.userId
        );
        state.group = state.group
          ? {
              ...state.group,
              blockedMembers: [...state.group.blockedMembers, member!],
              members: state.group.members.filter(
                (m) => m._id !== action.meta.arg.userId
              ),
            }
          : null;
        state.message = "User blocked successfully";
      })
      .addCase(adminBlockUser.rejected, (state, action) => {
        state.loading = false;
        console.log(action);
        state.error = action.error.message as string;
        state.success = false;
      })
      .addCase(adminUnblockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(adminUnblockUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const member = state.group?.blockedMembers.find(
          (m) => m._id === action.meta.arg.userId
        );
        state.group = state.group
          ? {
              ...state.group,
              members: [...state.group.members, member!],
              blockedMembers: state.group.blockedMembers.filter(
                (m) => m._id !== action.meta.arg.userId
              ),
            }
          : null;
        state.message = "User unblocked successfully";
      })
      .addCase(adminUnblockUser.rejected, (state, action) => {
        state.loading = false;
        console.log(action);
        state.error = action.error.message as string;
        state.success = false;
      })
      .addCase(userBlockGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(userBlockGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.group = action.payload.group;
        state.message = "Group blocked successfully";
      })
      .addCase(userBlockGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })
      .addCase(userUnblockGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(userUnblockGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.group = action.payload.group;
        state.message = "Group unblocked successfully";
      })
      .addCase(userUnblockGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
        state.success = false;
      })

      .addCase(toggleAdminStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleAdminStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const userId = action.meta.arg.userId;
        const newAdmin = state.group?.members.find((m) => m._id === userId);
        if (action.meta.arg.makeAdmin) {
          state.group = state.group
            ? {
                ...state.group,
                admins: [...state.group.admins, newAdmin!],
              }
            : null;
        } else {
          state.group = state.group
            ? {
                ...state.group,
                admins: state.group.admins.filter((a) => a._id !== userId),
              }
            : null;
        }
        state.message = "Admin status updated successfully";
      })
      .addCase(toggleAdminStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });
  },
});

export const { clearGroupState, clearErrors, clearSuccess } =
  groupSlice.actions;

export {
  createGroup,
  getGroupDetails,
  updateGroup,
  addUsersToGroup,
  removeUsersFromGroup,
  leaveGroup,
  adminBlockUser,
  adminUnblockUser,
  userBlockGroup,
  userUnblockGroup,
  toggleAdminStatus,
};

export default groupSlice.reducer;
