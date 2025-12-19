"use client";

import {
  Avatar,
  Box,
  Modal,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { ArrowBack } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useSocket } from "@/store/context/socketContext";
import {
  blockChat,
  clearErrors,
  clearSuccess,
  leaveGroup,
  setChat,
  toggleBlockGroup,
  unblockChat,
} from "@/store/chatSlice";
import Group from "./Group";
import ChatModel from "./chatModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { toast } from "sonner";

const Chat = () => {
  const [model, setModel] = useState(false);
  const [userInfo, setUserInfo] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { chat, success, message, error } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const { socket, onlineUser } = useSocket();

  const handleLeaveGroup = () => {
    if (!chat) return;
    if (chat.users.find((u) => u._id === user?._id)) {
      dispatch(leaveGroup(chat._id));
    } else {
      toast.error("You are not a member of this group", {
        duration: 4000,
        position: "top-center",
      });
    }
  };

  const blockUserChat = () => {
    if (!chat) return;
    if (!chat.isGroup) {
      if (chat.blockedChat) {
        dispatch(unblockChat(chat._id)).then((data) => console.log(data));
      } else {
        dispatch(blockChat(chat._id));
      }
    }
  };

  const blockGroupChat = () => {
    if (!chat) return;
    if (chat.isGroup) {
      if (chat.blockedChat) {
        dispatch(toggleBlockGroup({ chatId: chat._id, block: false }));
      } else {
        dispatch(toggleBlockGroup({ chatId: chat._id, block: true }));
      }
    }
  };

  useEffect(() => {
    if (success) {
      toast.success(message || "", {
        duration: 4000,
        position: "top-center",
      });
      dispatch(clearSuccess());
      return;
    }
    if (error) {
      toast.error(error || "", {
        duration: 4000,
        position: "top-center",
      });
      dispatch(clearErrors());
    }
  }, [success, error, message, dispatch]);

  useEffect(() => {
    if (!chat || !user) {
      router.push("/chat");
      return;
    }
    if (!socket) return;
    socket.on("typing", (data) => {
      if (user._id !== data) {
        setIsTyping(true);
      }
    });
    socket.on("stop typing", (data) => {
      if (user._id !== data) {
        setIsTyping(false);
      }
    });
  }, [chat, router, socket, user]);

  const otherUser = useMemo(
    () =>
      chat && user && !chat.isGroup
        ? chat.users[0]._id === user._id
          ? chat.users[1]
          : chat.users[0]
        : null,
    [chat, user]
  );

  if (!chat || !user) {
    return null;
  }

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #f9fafb 0%, #e3e9f0 100%)",
        }}
        className="w-full flex flex-col h-full bg-linear-to-br relative top-0 left-0 from-gray-100 to-blue-50"
      >
        {/* Chat Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          }}
          className="text-white p-4 flex items-center justify-between border-b h-[72px] border-black/5 shadow-lg"
        >
          <Box
            onClick={() => setUserInfo(true)}
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            {isMobile && (
              <IconButton
                onClick={() => dispatch(setChat(null))}
                sx={{
                  color: "#fff",
                  mr: 1,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                <ArrowBack />
              </IconButton>
            )}
            <Box sx={{ position: "relative", mr: 2 }}>
              <Avatar
                sx={{
                  width: { xs: 36, md: 42 },
                  height: { xs: 36, md: 42 },
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {chat.isGroup
                  ? chat.chatName.charAt(0).toUpperCase()
                  : otherUser?.name.charAt(0).toUpperCase() || "U"}
              </Avatar>
              {!chat.isGroup && otherUser && onlineUser.has(otherUser._id) && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 12,
                    height: 12,
                    bgcolor: "success.main",
                    borderRadius: "50%",
                    border: 2,
                    borderColor: "#fff",
                  }}
                />
              )}
            </Box>
            <Box>
              <Box
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                }}
              >
                {chat.isGroup ? chat.chatName : otherUser?.name || "Unknown"}
              </Box>
              {isTyping && (
                <Box
                  sx={{
                    fontSize: "0.75rem",
                    opacity: isTyping ? 0.8 : 0,
                    fontStyle: "italic",
                  }}
                >
                  typing...
                </Box>
              )}
            </Box>
          </Box>
          {/* <IconButton
            onClick={() => setUserInfo(true)}
            sx={{
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Info />
          </IconButton> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                sx={{
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                <EllipsisVertical className="w-6 h-6" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <Link
                  href={
                    chat.isGroup
                      ? `/group/${chat._id}`
                      : `/in/${otherUser?.username}`
                  }
                >
                  View Profile
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setUserInfo(true)}>
                {chat.isGroup ? "Group Info" : "User Info"}
              </DropdownMenuItem>
              {chat.isGroup ? (
                <>
                  <DropdownMenuItem onClick={handleLeaveGroup}>
                    Leave Group
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={
                      chat.adminBlockedUsers.find((u) => u._id === user._id)
                        ? true
                        : false
                    }
                    onClick={blockGroupChat}
                  >
                    {chat.blockedChatUsers.find((u) => u._id === user._id)
                      ? "Unblock Group"
                      : "Block Group"}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={blockUserChat}>
                  {chat.blockedChat ? "Unblock User" : "Block User"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Modals */}
        {chat && chat.isGroup && userInfo ? (
          <Modal open={userInfo} onClose={() => setUserInfo(false)}>
            <Box className="mx-auto py-4 mt-20 border-0 outline-0 max-w-[90vw] md:max-w-[400px] bg-white rounded-lg shadow-xl flex flex-col justify-center items-center">
              {model ? (
                <Group
                  group={chat ? true : false}
                  setGroup={(val: boolean) => setModel(val)}
                />
              ) : (
                <div className="p-4 w-full">
                  <div className="text-xl font-bold text-center mb-4 text-gray-800">
                    Group Info
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {chat.users &&
                      chat.users.map((user) => {
                        return (
                          <div
                            key={user._id}
                            className="px-3 py-1 text-white text-sm rounded-full"
                            style={{
                              background:
                                "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            }}
                          >
                            {user.name}
                          </div>
                        );
                      })}
                  </div>
                  <button
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    }}
                    className="w-full py-2 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    onClick={() => setModel(true)}
                  >
                    Update Group
                  </button>
                </div>
              )}
            </Box>
          </Modal>
        ) : (
          <Modal open={userInfo} onClose={() => setUserInfo(false)}>
            <Box className="mx-auto py-6 mt-20 border-0 outline-0 max-w-[90vw] md:max-w-[350px] bg-white rounded-lg shadow-xl flex flex-col justify-center items-center">
              <Box className="flex flex-col justify-center items-center p-4">
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    fontSize: "2rem",
                  }}
                >
                  {otherUser?.name.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <h1 className="font-bold text-xl text-gray-800">
                  {otherUser?.name || "User"}
                </h1>
                <p className="text-gray-500 mt-1">
                  @{otherUser?.username || "username"}
                </p>
                <Button variant={"outline"} className="mt-6" asChild>
                  <Link href={`/in/${otherUser?.username}`}>View Profile</Link>
                </Button>
              </Box>
            </Box>
          </Modal>
        )}

        {chat && <ChatModel />}
      </div>
    </>
  );
};

export default Chat;
