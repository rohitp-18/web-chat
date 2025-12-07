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
import { ArrowBack, Send, Info } from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppDispatch, RootState } from "@/store/store";
import axios from "@/store/axios";
import { useRouter } from "next/navigation";
import { useSocket } from "@/store/context/socketContext";
import { Message } from "@/store/types/chatType";
import { setChat, updateChats } from "@/store/chatSlice";
import Group from "./Group";
import ChatModel from "./chatModel";

const Chat = () => {
  const [model, setModel] = useState(false);
  const [userInfo, setUserInfo] = useState(false);
  const [message, setMessage] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { chat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const { socket } = useSocket();

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

  useEffect(() => {
    const getMessage = async () => {
      if (!chat || !socket) return;
      try {
        const { data } = await axios.get(`/message/${chat._id}`);
        setMessage(data.message);
      } catch (error) {
        console.log(error);
      }
    };
    getMessage();
  }, [chat, socket]);

  useEffect(() => {
    if (!socket || !chat) return;
    socket.on("message received", (data) => {
      if (!chat._id || chat._id !== data.chat._id) {
      } else {
        setMessage((prev) => [...prev, data]);
        dispatch(updateChats({ _id: chat._id, message: data }));
      }
    });
  }, [socket, chat, setMessage, dispatch]);

  const typingInp = useCallback(
    (value: string) => {
      if (!socket || !chat || !user) {
        return;
      }

      if (!typing) {
        setTyping(true);
        socket.emit("typing", { chat: chat._id, user: user._id });
      }
      setMessageInput(value);

      const lastType = new Date().getTime();
      setTimeout(() => {
        const newTime = new Date().getTime();

        if (newTime - lastType >= 4000) {
          socket.emit("stop typing", { chat: chat._id, user: user._id });
          setTyping(false);
        }
      }, 5000);
    },
    [setMessageInput, socket, typing, chat, user]
  );

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket || !chat || !user) return;
    if (messageInput.length <= 0) {
      return;
    }

    socket.emit("stop typing", { chat: chat._id, user: user._id });
    try {
      const { data } = await axios.post("/message/", {
        content: messageInput,
        chatId: chat._id,
      });

      setMessageInput("");
      socket.emit("new message", data.message);
      setMessage([...message, data.message]);
      dispatch(updateChats({ _id: chat._id, message: data.message }));
    } catch (error) {
      console.log(error);
    }
  };

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
        className="w-full flex flex-col h-full bg-linear-to-br md:fixed top-0 left-0 from-gray-100 to-blue-50"
      >
        {/* Chat Header */}
        <div className="bg-linear-to-br from-indigo-500 to-purple-600 text-white p-4 flex items-center justify-between border-b border-black/5 shadow-lg">
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
              {!chat.isGroup && (
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
                    opacity: 0.8,
                    fontStyle: "italic",
                  }}
                >
                  typing...
                </Box>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={() => setUserInfo(true)}
            sx={{
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Info />
          </IconButton>
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
                            className="px-3 py-1 text-white text-sm bg-linear-to-r from-blue-500 to-indigo-500 rounded-full"
                          >
                            {user.name}
                          </div>
                        );
                      })}
                  </div>
                  <button
                    className="w-full py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
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
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontSize: "2rem",
                  }}
                >
                  {otherUser?.name.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <h1 className="font-bold text-xl text-gray-800">
                  {otherUser?.name || "User"}
                </h1>
                <p className="text-gray-500 mt-1">
                  {otherUser?.email || "No email"}
                </p>
              </Box>
            </Box>
          </Modal>
        )}

        {/* Chat Messages */}
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          {message && <ChatModel message={message} />}
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
          }}
          className="fixed bottom-0 left-0 w-full"
        >
          <form
            onSubmit={sendMessage}
            style={{ display: "flex", gap: "12px", alignItems: "center" }}
          >
            <Box sx={{ flexGrow: 1, position: "relative" }}>
              <input
                value={messageInput}
                type="text"
                onChange={(e) => typingInp(e.target.value)}
                className="w-full p-2.5 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 placeholder-gray-500"
                autoFocus
                placeholder="Type your message..."
                style={{
                  fontSize: "0.7rem",
                  transition: "all 0.3s ease",
                }}
              />
            </Box>
            <IconButton
              type="submit"
              disabled={!messageInput.trim()}
              sx={{
                background: messageInput.trim()
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "rgba(0,0,0,0.12)",
                color: "#fff",
                width: 38,
                height: 38,
                "&:hover": {
                  background: messageInput.trim()
                    ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
                    : "rgba(0,0,0,0.12)",
                },
                "&:disabled": {
                  color: "rgba(0,0,0,0.26)",
                },
              }}
            >
              <Send sx={{ fontSize: 20 }} />
            </IconButton>
          </form>
        </Box>
      </div>
    </>
  );
};

export default Chat;
