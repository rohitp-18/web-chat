"use client";

import { Box, Modal, IconButton, useMediaQuery, useTheme } from "@mui/material";
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
  setChat,
  unblockChat,
  updateGroupChat,
} from "@/store/chatSlice";
import ChatModel from "./chatModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  leaveGroup,
  userBlockGroup,
  userUnblockGroup,
} from "@/store/groupSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import GroupInfo from "./groupInfo";

const Chat = () => {
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

  const leaveHandler = () => {
    if (!chat?.group || !user) return;
    dispatch(leaveGroup(chat.group._id)).then((res) => {
      if (res.payload?.success) {
        dispatch(
          updateGroupChat({
            ...chat,
            users: chat.users.filter((m) => m._id !== user?._id),
            oldUsers: [...chat.oldUsers, user._id],
            group: {
              ...chat.group,
              members: chat.group?.members.filter((m) => m != user._id),
            },
          })
        );
      }
    });
  };

  const unblockHandler = () => {
    if (!chat?.group || !user) return;
    dispatch(userUnblockGroup(chat.group._id)).then((res) => {
      if (res.payload?.success) {
        dispatch(
          updateGroupChat({
            ...chat,
            users: [...chat.users, user],
            oldUsers: chat.oldUsers.filter((m) => m !== user._id),
            group: {
              ...chat.group,
              members: [...(chat.group?.members ?? []), user._id],
              unblockChat: chat.group?.userBlocked.filter(
                (m) => m !== user._id
              ),
            },
          })
        );
      }
    });
  };

  const blockUserChat = () => {
    if (!chat) return;
    if (!chat.isGroup) {
      if (chat.blockedChat) {
        dispatch(unblockChat(chat._id));
      } else {
        dispatch(blockChat(chat._id));
      }
    }
  };

  const blockGroupChat = () => {
    if (!chat?.group || !user) return;
    dispatch(userBlockGroup(chat.group._id)).then((res) => {
      if (res.payload?.success) {
        dispatch(
          updateGroupChat({
            ...chat,
            oldUsers: [...chat.oldUsers, user._id],
            users: chat.users.filter((m) => m._id !== user._id),
            group: {
              ...chat.group,
              members: chat.group?.members.filter((m) => m != user._id),
              userBlocked: [...(chat.group?.userBlocked ?? []), user._id],
            },
          })
        );
      }
    });
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
              <Avatar className="w-9 md:w-10 h-9 md:h-10 bg-blue-500 text-white text-4xl">
                <AvatarImage
                  src={chat.isGroup ? "" : otherUser?.avatar?.url}
                  alt={chat.isGroup ? chat.chatName : otherUser?.name || "User"}
                />
                <AvatarFallback className="bg-white/20 backdrop-blur-[10px] text-white font-semibold text-sm">
                  {chat.isGroup
                    ? chat.chatName.charAt(0).toUpperCase()
                    : otherUser?.name.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
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
                  View {chat.isGroup ? "Group Details" : "Profile"}
                </Link>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setUserInfo(true)}>
                {chat.isGroup ? "Group Info" : "User Info"}
              </DropdownMenuItem>
              {chat.isGroup ? (
                !chat.group?.admins.includes(user._id) && (
                  <>
                    {chat.group?.members.includes(user._id) && (
                      <DropdownMenuItem onClick={leaveHandler}>
                        Leave Group
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      disabled={
                        chat.group?.userBlocked.find((u) => u === user._id)
                          ? true
                          : false
                      }
                      onClick={
                        chat.group?.userBlocked.includes(user._id)
                          ? unblockHandler
                          : blockGroupChat
                      }
                    >
                      {chat.group?.userBlocked.find((u) => u === user._id)
                        ? "Unblock Group"
                        : "Block Group"}
                    </DropdownMenuItem>
                  </>
                )
              ) : (
                <DropdownMenuItem onClick={blockUserChat}>
                  {chat.blockedChat ? "Unblock User" : "Block User"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Modals */}
        {chat && userInfo && (
          <Modal open={userInfo} onClose={() => setUserInfo(false)}>
            {chat.isGroup && chat.group ? (
              <GroupInfo />
            ) : (
              <Box className="mx-auto py-6 mt-20 border-0 outline-0 max-w-[90vw] md:max-w-[350px] bg-white rounded-lg shadow-xl flex flex-col justify-center items-center">
                <Box className="flex flex-col justify-center items-center p-4">
                  <Avatar className="w-20 h-20 mb-4 bg-blue-500 text-white text-4xl">
                    <AvatarImage
                      src={otherUser?.avatar?.url}
                      alt={otherUser?.name || "User"}
                    />
                    <AvatarFallback
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      }}
                    >
                      {otherUser?.name.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="font-bold text-xl text-gray-800">
                    {otherUser?.name || "User"}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    @{otherUser?.username || "username"}
                  </p>
                  <Button variant={"outline"} className="mt-6" asChild>
                    <Link href={`/in/${otherUser?.username}`}>
                      View Profile
                    </Link>
                  </Button>
                </Box>
              </Box>
            )}
          </Modal>
        )}

        {chat && <ChatModel />}
      </div>
    </>
  );
};

export default Chat;
