import { Box, IconButton } from "@mui/material";
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isNewDay,
} from "@/utils/logic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Message } from "@/store/types/chatType";
import { useSocket } from "@/store/context/socketContext";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Reply, Send } from "@mui/icons-material";
import axios from "@/store/axios";
import { toggleBlockChat, updateChats } from "@/store/chatSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import ChatInfo from "./chatInfo";
import { Button } from "../ui/button";
import { ArrowDown, Check, LucideCheckCheck, Trash2, X } from "lucide-react";

const ChatModel = () => {
  const [messageInput, setMessageInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [top, setTop] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [parentMessage, setParentMessage] = useState<Message | null>(null);
  const [replying, setReplying] = useState(false);
  const [message, setMessage] = useState<Message[]>([]);

  const { socket, isConnected } = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const { chat } = useSelector((root: RootState) => root.chat);
  const { user } = useSelector((root: RootState) => root.user);
  const ref = useRef<HTMLDivElement>(null);

  const typingInp = useCallback(
    (value: string) => {
      if (!socket || !chat || !user) {
        return;
      }

      if (!typing) {
        setTyping(true);
        socket.emit("typing", {
          receiver:
            chat.users[0]._id === user._id
              ? chat.users[1]._id
              : chat.users[0]._id,
          user: user._id,
        });
      }
      setMessageInput(value);

      const lastType = new Date().getTime();
      setTimeout(() => {
        const newTime = new Date().getTime();

        if (newTime - lastType >= 4000) {
          socket.emit("stop typing", {
            receiver:
              chat.users[0]._id === user._id
                ? chat.users[1]._id
                : chat.users[0]._id,
            user: user._id,
          });
          setTyping(false);
        }
      }, 5000);
    },
    [setMessageInput, socket, typing, chat, user]
  );

  const deleteMessage = async (deletedMsg: Message) => {
    try {
      await axios.delete(`/message/${deletedMsg._id}`);
      deletedMsg.isDeleted = true;
      deletedMsg.content = "This message has been deleted.";
      setMessage((prevMessages: Message[]) =>
        prevMessages.map((msg) =>
          msg._id === deletedMsg._id ? deletedMsg : msg
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socket || !chat || !user) return;
    if (messageInput.length <= 0) {
      return;
    }

    socket.emit("stop typing", {
      receiver:
        chat.users[0]._id === user._id ? chat.users[1]._id : chat.users[0]._id,
      user: user._id,
    });
    try {
      const { data } = await axios.post("/message/", {
        content: messageInput,
        chatId: chat._id,
        parentMessage: parentMessage?._id,
      });

      setMessageInput("");
      setParentMessage(null);
      setReplying(false);
      socket.emit("new message", data.message);
      setMessage((prevMessages: Message[]) => [...prevMessages, data.message]);
      dispatch(updateChats({ _id: chat._id, message: data.message }));
    } catch (error) {
      console.log(error);
    }
  };

  interface readData {
    chatId: string;
    message: Message;
    userId: string;
    senderId: string;
  }

  useEffect(() => {
    if (!socket || !chat || !user) return;

    socket.on("all_messages_read", (data: readData) => {
      if (chat && chat._id === data.chatId) {
        setMessage((prevMessages: Message[]) =>
          prevMessages.map((msg) => ({
            ...msg,
            read: msg.read.includes(data.senderId)
              ? msg.read
              : [...msg.read, data.senderId],
          }))
        );
      }
      dispatch(updateChats({ _id: data.chatId, message: data.message }));
    });

    return () => {
      if (socket) {
        socket.off("all_messages_read");
      }
    };
  }, [socket, chat, dispatch, user]);

  useEffect(() => {
    if (!socket || !chat || !user) return;

    socket.on("chat_blocked", (data: { chatId: string; blockedBy: string }) => {
      if (chat && chat._id === data.chatId) {
        dispatch(
          toggleBlockChat({
            chatId: data.chatId,
            blockedBy: data.blockedBy,
            status: true,
          })
        );
      }
    });

    return () => {
      if (socket) {
        socket.off("chat_blocked");
      }
    };
  }, [socket, chat, dispatch, user]);

  useEffect(() => {
    if (!socket || !chat || !user) return;

    socket.on(
      "chat_unblocked",
      (data: { chatId: string; blockedBy: string }) => {
        if (chat && chat._id === data.chatId) {
          dispatch(
            toggleBlockChat({
              chatId: data.chatId,
              blockedBy: data.blockedBy,
              status: false,
            })
          );
        }
      }
    );

    return () => {
      if (socket) {
        socket.off("chat_unblocked");
      }
    };
  }, [socket, chat, dispatch, user]);

  useEffect(() => {
    if (!user || !socket) return;

    socket.on("message_read", (data: readData) => {
      if (chat && chat._id === data.chatId) {
        setMessage((prevMessages: Message[]) =>
          prevMessages.map((msg) => ({
            ...msg,
            read: msg.read.includes(data.senderId)
              ? msg.read
              : [...msg.read, data.senderId],
          }))
        );
      }
      dispatch(updateChats({ _id: data.chatId, message: data.message }));
    });
    return () => {
      if (socket) {
        socket.off("message_read");
      }
    };
  }, [user, socket, chat, dispatch]);

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
    if (isConnected) {
      console.log(isConnected);
      getMessage();
    }
  }, [chat, socket, isConnected]);

  // handle new message received from socket
  useEffect(() => {
    if (!socket || !chat || !user) return;
    socket.on("message received", (data) => {
      if (!chat._id || chat._id !== data.chat._id) {
      } else {
        setMessage((prev) => [...prev, data]);
        console.log("new message", data);
        dispatch(updateChats({ _id: chat._id, message: data }));

        socket.emit("read_message", {
          chatId: data.chat._id,
          message: data,
          userId: data.sender._id,
          senderId: user._id,
        });
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [socket, chat, dispatch, user]);

  // handle scrolling the page
  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.scrollHeight === top) {
      setScrollPosition(ref.current.scrollHeight);
      return;
    }
    const height = ref.current.scrollHeight - ref.current.clientHeight;
    ref.current.scrollTop = height;
    setTop(height);
    setScrollPosition(height);
  }, [message, top]);

  if (!user || !chat) return null;

  return (
    <>
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <div
          className="px-2 md:px-4 py-2 w-full relative overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            overflowY: "auto",
            scrollBehavior: "smooth",
            height: replying ? "calc(100vh - 201px)" : "calc(100vh - 138px)",
          }}
          ref={ref}
          onScroll={(el) => {
            setScrollPosition(el.currentTarget.scrollTop);
          }}
        >
          <ChatInfo />
          {message &&
            message.map((m, i) => (
              <Fragment key={m._id}>
                {isNewDay(message, i) && (
                  <div className="w-full flex justify-center my-4">
                    <span className="px-3 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full shadow-xs">
                      {new Date(m.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div
                  id={`m-${m._id}`}
                  className="flex items-end mb-1 md:mb-0.5 group"
                >
                  {(isSameSender(message, m, i, user._id) ||
                    isLastMessage(message, i, user._id) ||
                    i === message.length - 1 ||
                    isNewDay(message, i + 1)) &&
                    m.sender._id !== user._id && (
                      <Link
                        href={`/profile/${m.sender.username}`}
                        className="flex"
                      >
                        <Avatar
                          className="w-8 h-8 md:w-10 md:h-10"
                          style={{ marginRight: "8px", flexShrink: 0 }}
                        >
                          <AvatarImage
                            src={m.sender.avatar?.url}
                            alt={m.sender.name}
                          />
                          <AvatarFallback
                            style={{
                              background:
                                "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
                              color: "#047857",
                              fontSize: "0.875rem",
                              boxShadow: "0 4px 12px rgba(110, 231, 183, 0.3)",
                            }}
                            className="flex font-semibold items-center justify-center"
                          >
                            {m.sender.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    )}
                  {m.sender._id === user._id && (
                    <div className="ml-auto flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <IconButton
                        size="small"
                        sx={{
                          width: 28,
                          height: 28,
                          color: "text.secondary",
                          "&:hover": {
                            bgcolor: "rgba(239, 68, 68, 0.1)",
                            color: "error.main",
                          },
                        }}
                        onClick={() => deleteMessage(m)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          width: 28,
                          height: 28,
                          color: "text.secondary",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => {
                          setParentMessage(m);
                          setReplying(true);
                        }}
                      >
                        <Reply sx={{ fontSize: 16 }} />
                      </IconButton>
                    </div>
                  )}
                  <div
                    className={`px-5 py-2 my-0.5 text-sm relative leading-relaxed wrap-break-word transition-all duration-300 inline-block max-w-[90%] md:max-w-[70%] ${
                      m.sender._id === user._id
                        ? "text-blue-900 rounded-[18px_18px_4px_18px]"
                        : "text-emerald-900 rounded-[18px_18px_18px_4px]"
                    }`}
                    style={{
                      background: `${
                        m.sender._id === user._id
                          ? "linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%)"
                          : "linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%)"
                      }`,
                      marginLeft: isSameSenderMargin(message, m, i, user._id),
                      boxShadow: `${
                        m.sender._id === user._id
                          ? "0 4px 12px rgba(191, 219, 254, 0.3)"
                          : "0 4px 12px rgba(167, 243, 208, 0.3)"
                      }`,
                      fontFamily: "Segoe UI, sans-serif",
                    }}
                    // ref={i === message.length - 1 ? span : spans}
                  >
                    {m.parentMessage && (
                      <div
                        onClick={() => {
                          const element = m.parentMessage
                            ? document.getElementById(
                                `m-${m.parentMessage._id}`
                              )
                            : null;
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                            element.classList.add(
                              "transition-all",
                              "animate-[highlight_2s_ease-in-out]"
                            );
                            setTimeout(() => {
                              element.classList.remove(
                                "animate-[highlight_2s_ease-in-out]"
                              );
                            }, 2000);
                          }
                        }}
                        className="mb-1 px-2 py-0.5 bg-gray-100 rounded-md border-l-4 border-blue-400"
                      >
                        <span className="font-medium text-[12px]">
                          {m.parentMessage.sender.name
                            ? m.parentMessage.sender.name
                            : "Unknown User"}
                        </span>
                        <p className="text-xs text-gray-500">
                          {m.parentMessage.content.length > 30
                            ? m.parentMessage.content.substring(0, 30) + "..."
                            : m.parentMessage.content}
                        </p>
                      </div>
                    )}
                    {m.content}
                    <div className="w-[35px] h-2.5 inline-block text-gray-500"></div>
                    <span className="absolute bottom-2 right-4 text-[8px] text-end text-gray-500">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {m.sender._id === user._id && (
                      <span
                        className={`absolute bottom-2 right-0.5 text-[8px] text-end ${
                          m.read.length === chat.users.length
                            ? "text-blue-500"
                            : "text-gray-500"
                        }`}
                      >
                        {m.read.length === chat.users.length ? (
                          <LucideCheckCheck className="text-blue-500 w-3 h-3" />
                        ) : (
                          <Check className="text-gray-500 w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                  {m.sender._id !== user._id && (
                    <div className="ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <IconButton
                        size="small"
                        sx={{
                          width: 28,
                          height: 28,
                          color: "text.secondary",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => {
                          setParentMessage(m);
                          setReplying(true);
                        }}
                      >
                        <Reply sx={{ fontSize: 16 }} />
                      </IconButton>
                    </div>
                  )}
                </div>
              </Fragment>
            ))}
          {scrollPosition !== top && scrollPosition < top && (
            <div
              onClick={(e) => {
                e.preventDefault();
                const height =
                  ref.current!.scrollHeight - ref.current!.clientHeight;
                ref.current!.scrollTop = height;
                setTop(height);
                setScrollPosition(height);
              }}
              className="fixed bottom-24 md:bottom-20 right-4 z-10"
            >
              <Button
                variant={"default"}
                size={"icon"}
                className="opacity-50 hover:opacity-100 hover:bg-gray-100"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Box>

      <Box
        sx={{
          p: { xs: 1, md: 1.5 },
          borderTop: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
          backgroundColor: "#fff",
        }}
        className="w-full"
      >
        {!chat.blockedChat ? (
          <>
            {replying && parentMessage && (
              <div className="mb-2 p-2 w-full bg-gray-100 rounded-t-md flex justify-between items-center">
                <div className="flex justify-between items-center mb-1">
                  <Avatar
                    className="w-6 h-6 md:w-7 md:h-7"
                    style={{ marginRight: "8px", flexShrink: 0 }}
                  >
                    <AvatarImage
                      src={parentMessage.sender.avatar?.url}
                      alt={parentMessage.sender.name}
                    />
                    <AvatarFallback
                      style={{
                        background:
                          "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
                        color: "#047857",
                        fontSize: "0.875rem",
                        boxShadow: "0 4px 12px rgba(110, 231, 183, 0.3)",
                      }}
                      className="flex font-semibold items-center justify-center"
                    >
                      {parentMessage.sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 flex flex-col items-start">
                    <span className="font-medium text-sm">
                      {parentMessage.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {parentMessage.content.length > 30
                        ? parentMessage.content.substring(0, 30) + "..."
                        : parentMessage.content}
                    </span>
                  </div>
                </div>
                <div className="">
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => {
                      setReplying(false);
                      setParentMessage(null);
                    }}
                  />
                </div>
              </div>
            )}
            <form
              onSubmit={sendMessage}
              style={{ display: "flex", gap: "12px", alignItems: "center" }}
            >
              <Box sx={{ flexGrow: 1, position: "relative" }}>
                <input
                  value={messageInput}
                  type="text"
                  onChange={(e) => typingInp(e.target.value)}
                  className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-400 shadow-sm"
                  autoFocus
                  placeholder="Type your message..."
                  style={{
                    fontSize: "0.8rem",
                    transition: "all 0.3s ease",
                    fontFamily: "Segoe UI, sans-serif",
                  }}
                />
              </Box>
              <IconButton
                type="submit"
                disabled={!messageInput.trim()}
                sx={{
                  background: messageInput.trim()
                    ? "linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%)"
                    : "rgba(0,0,0,0.12)",
                  color: messageInput.trim() ? "#1e40af" : "rgba(0,0,0,0.26)",
                  width: { xs: 32, md: 38 },
                  height: { xs: 32, md: 38 },
                  flexShrink: 0,
                  "&:hover": {
                    background: messageInput.trim()
                      ? "linear-gradient(135deg, #93c5fd 0%, #bfdbfe 100%)"
                      : "rgba(0,0,0,0.12)",
                  },
                  "&:disabled": {
                    color: "rgba(0,0,0,0.26)",
                  },
                }}
              >
                <Send sx={{ fontSize: { xs: 18, md: 20 } }} />
              </IconButton>
            </form>
          </>
        ) : (
          <div className="w-full flex items-center justify-center px-4">
            <div className="flex items-center gap-3 bg-red-50 rounded-lg border border-red-200 px-4 py-1 w-full">
              <X className="w-5 h-5 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-700">
                  <span className="font-semibold text-red-900">
                    Chat Blocked
                  </span>{" "}
                  by{" "}
                  <Link
                    href={`/in/${chat.blockedBy?.username}`}
                    className="font-medium hover:underline text-red-900"
                  >
                    {chat.blockedBy?.name}
                  </Link>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-100 shrink-0"
              >
                Learn More
              </Button>
            </div>
          </div>
        )}
      </Box>
    </>
  );
};

export default ChatModel;
