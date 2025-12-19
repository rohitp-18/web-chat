import { useState } from "react";
import {
  Box,
  Stack,
  Avatar,
  Modal,
  Button,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDispatch, useSelector } from "react-redux";
import { user } from "@/store/types/userType";
import { AppDispatch, RootState } from "@/store/store";
import { createGroup } from "@/store/chatSlice";
import { findUsers } from "@/store/userSlice";
import { Close, PersonAdd } from "@mui/icons-material";

const Group = ({
  group,
  setGroup,
}: {
  group: boolean;
  setGroup: (value: boolean) => void;
}) => {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  // const [searchValue, setSearchValue] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<user[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { searchResults } = useSelector((state: RootState) => state.user);

  const findUser = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
    dispatch(findUsers(e.target.value));
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(createGroup({ users: selectedUserId, name }));
  };

  const addHandler = (item: user) => {
    if (!selectedUserId.includes(item._id)) {
      setSelectedUserId([...selectedUserId, item._id]);
      setSelectedUsers([...selectedUsers, item]);
    }
  };

  const removeHandler = (item: user) => {
    setSelectedUserId(selectedUserId.filter((id) => id !== item._id));
    setSelectedUsers(selectedUsers.filter((user) => user._id !== item._id));
  };

  return (
    <Modal
      open={group}
      onClose={() => setGroup(false)}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "90%",
          maxWidth: "450px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          padding: "32px",
          outline: "none",
          animation: "slideUp 0.3s ease-out",
          "@keyframes slideUp": {
            from: {
              opacity: 0,
              transform: "translateY(20px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Box>
            <Box
              sx={{
                fontSize: "24px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "4px",
              }}
            >
              Create Group
            </Box>
            <Box sx={{ fontSize: "12px", color: "#666" }}>
              Add members to your new group
            </Box>
          </Box>
          <Box
            onClick={() => setGroup(false)}
            sx={{
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <Close sx={{ fontSize: "24px", color: "#666" }} />
          </Box>
        </Box>

        <form onSubmit={(e) => submitHandler(e)}>
          {/* Group Name Input */}
          <TextField
            fullWidth
            placeholder="Enter group name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              marginBottom: "16px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                },
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 16px",
                fontSize: "14px",
              },
            }}
            variant="outlined"
          />

          {/* Search Users Input */}
          <TextField
            fullWidth
            placeholder="Search users..."
            type="text"
            value={input}
            onChange={(e) => findUser(e)}
            sx={{
              marginBottom: "20px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.1)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                },
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 16px",
                fontSize: "14px",
              },
            }}
            variant="outlined"
          />

          {/* Selected Users Chips */}
          {selectedUsers.length > 0 && (
            <Box
              sx={{
                marginBottom: "20px",
                padding: "12px",
                backgroundColor: "#f5f7ff",
                borderRadius: "12px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {selectedUsers.map((user) => (
                <Chip
                  key={user._id}
                  label={user.name}
                  onDelete={() => removeHandler(user)}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontWeight: "500",
                    "& .MuiChip-deleteIcon": {
                      color: "white",
                      "&:hover": {
                        color: "#fff",
                      },
                    },
                  }}
                  avatar={
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  }
                />
              ))}
            </Box>
          )}

          {/* Users List */}
          <Box
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              marginBottom: "20px",
              padding: "8px 0",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f0f0f0",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#667eea",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#764ba2",
                },
              },
            }}
          >
            {!searchResults ? (
              <Box
                sx={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                {input.length < 1
                  ? "Search for users to add"
                  : "No users found"}
              </Box>
            ) : (
              searchResults.map((user) => (
                <Box
                  key={user._id}
                  onClick={() => addHandler(user)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    marginBottom: "6px",
                    "&:hover": {
                      backgroundColor: "#f5f7ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontSize: "14px",
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box
                        sx={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#222",
                        }}
                      >
                        {user.name}
                      </Box>
                      <Box sx={{ fontSize: "12px", color: "#999" }}>
                        @{user.username}
                      </Box>
                    </Box>
                  </Box>
                  <PersonAdd
                    sx={{
                      fontSize: "20px",
                      color: "#667eea",
                      opacity: 0.7,
                    }}
                  />
                </Box>
              ))
            )}
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button
              onClick={() => setGroup(false)}
              sx={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: "600",
                border: "1px solid #ddd",
                color: "#666",
                backgroundColor: "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#999",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || selectedUserId.length === 0}
              sx={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: "600",
                background:
                  selectedUserId.length > 0 && name.trim()
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#ddd",
                color: "white",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow:
                    selectedUserId.length > 0 && name.trim()
                      ? "0 8px 20px rgba(102, 126, 234, 0.3)"
                      : "none",
                  transform:
                    selectedUserId.length > 0 && name.trim()
                      ? "translateY(-2px)"
                      : "none",
                },
                "&:disabled": {
                  opacity: 0.6,
                  cursor: "not-allowed",
                },
              }}
            >
              Create Group
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default Group;
