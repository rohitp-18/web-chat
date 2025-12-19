"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Stack,
  Avatar,
  Box,
  Modal,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "@/store/axios";
import { RootState } from "@/store/store";
import { user } from "@/store/types/userType";
import { chat } from "@/store/types/chatType";
import { Close, PersonAdd, LogoutOutlined } from "@mui/icons-material";
import { toast } from "sonner";

const UpdateGroupModal = ({
  group,
  open,
  setModel,
}: {
  group: chat;
  open: boolean;
  setModel: () => void;
}) => {
  const [name, setName] = useState(group.chatName);
  const [searchInp, setSearchInp] = useState("");
  const [searchValue, setSearchValue] = useState<user[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<user[]>(group.users);
  const [selectedUserId, setSelectedUserId] = useState<string[]>(
    group.users.map((uer: user) => uer._id)
  );
  const { user } = useSelector((state: RootState) => state.user);

  const findUser = async (search: string) => {
    try {
      setSearchInp(search);
      const { data } = await axios.get(`/user/find?search=${search}`);

      setSearchValue(data.filter((u: user) => user && u._id !== user._id));
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = () => {
    axios.put("/chats/update", {
      groupId: group._id,
      name,
      users: selectedUserId,
    });
    setModel();
  };

  const addHandler = (item: user) => {
    if (!selectedUserId.includes(item._id)) {
      setSelectedUserId([...selectedUserId, item._id]);
      setSelectedUsers([...selectedUsers, item]);
    }
  };

  const removeHandler = (item: user) => {
    setSelectedUserId(selectedUserId.filter((id) => id !== item._id));
    setSelectedUsers(selectedUsers.filter((users) => users._id !== item._id));
  };

  const leaveHandler = () => {
    if (!user) return;
    if (user._id === group.admin._id) {
      toast.error(
        "Admin cannot leave the group. Please assign a new admin first.",
        {
          position: "top-center",
        }
      );
      return;
    }
    setSelectedUserId(selectedUserId.filter((id) => id !== user._id));
    setSelectedUsers(selectedUsers.filter((users) => users._id !== user._id));
    submitHandler();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => setModel()}
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "4px",
                }}
              >
                Update Group
              </Box>
              <Box sx={{ fontSize: "12px", color: "#666" }}>
                Manage group settings and members
              </Box>
            </Box>
            <Box
              onClick={() => setModel()}
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitHandler();
            }}
          >
            {/* Group Name Input */}
            <TextField
              fullWidth
              placeholder="Group name"
              type="text"
              name="name"
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
              placeholder="Search users to add..."
              type="text"
              value={searchInp}
              onChange={(e) => findUser(e.target.value)}
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

            {/* Current Members Section */}
            {selectedUsers.length > 0 && (
              <Box
                sx={{
                  marginBottom: "20px",
                }}
              >
                <Box
                  sx={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#666",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Members ({selectedUsers.length})
                </Box>
                <Box
                  sx={{
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
              </Box>
            )}

            {/* Users List */}
            <Box
              sx={{
                maxHeight: "280px",
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
              {searchValue.length <= 0 ? (
                <Box
                  sx={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "14px",
                  }}
                >
                  {searchInp.length < 1
                    ? "Search for users to add"
                    : "No users found"}
                </Box>
              ) : (
                searchValue.map((user) => (
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
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
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
                type="button"
                onClick={() => leaveHandler()}
                sx={{
                  flex: 0.4,
                  padding: "10px 12px",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "1px solid #ff6b6b",
                  color: "#ff6b6b",
                  backgroundColor: "#fff5f5",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  "&:hover": {
                    backgroundColor: "#ffe0e0",
                    borderColor: "#ff5252",
                  },
                }}
              >
                <LogoutOutlined sx={{ fontSize: "16px" }} />
                Leave
              </Button>
              <Button
                onClick={() => setModel()}
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
                sx={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Update
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default UpdateGroupModal;
