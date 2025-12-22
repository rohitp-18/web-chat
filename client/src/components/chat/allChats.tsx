/* eslint-disable react-hooks/rules-of-hooks */
import { Avatar } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { readAllMessage, setChat } from "@/store/chatSlice";
import { chat } from "@/store/types/chatType";
import { useSocket } from "@/store/context/socketContext";
import Link from "next/link";

function AllChats() {
  const { chats, chat, loading } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const { onlineUser, socket } = useSocket();

  const chatOpen = (item: chat) => {
    dispatch(setChat(item));
    if (socket) {
      socket.emit("all_read_message", {
        chatId: item._id,
        message: item.latestMessage,
        users: item.users,
        senderId: user?._id,
      });
    }
    dispatch(readAllMessage(item._id));
  };

  if (!chats || !user) {
    return null;
  }

  useEffect(() => {
    console.log(onlineUser);
  }, [onlineUser]);

  return (
    <div className="w-full md:min-w-[320px] md:max-w-[400px] bg-white rounded-none md:rounded-lg shadow-none md:shadow-lg p-3 md:p-4 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <span className="font-bold text-base md:text-lg text-gray-800">
          Chats
        </span>
        <div className="flex items-center space-x-2">
          <Link
            href={"/new"}
            className="p-2 rounded-full text-white hover:shadow-lg transition-all shadow-md"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div
        className="space-y-1 overflow-y-auto h-full"
        style={{ scrollbarWidth: "thin" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-xs text-gray-500">Loading chats...</span>
          </div>
        ) : !chats || chats.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-2xl mb-3">💬</div>
            <div className="text-gray-400 font-medium text-sm">
              No chats available
            </div>
            <div className="text-gray-300 text-xs mt-1">
              Start a new conversation
            </div>
          </div>
        ) : (
          chats.map((item) => {
            const latestMessage = item.latestMessage;
            const otherUser = item.isGroup
              ? null
              : item.users[0]._id === user._id
              ? item.users[1]
              : item.users[0];

            return (
              <div
                onClick={() => chatOpen(item)}
                key={item._id}
                className={`flex items-center p-1.5 rounded-xl cursor-pointer hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-100 group ${
                  chat && chat._id === item._id ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="relative">
                    <Avatar
                      sx={{
                        width: { xs: 40, md: 48 },
                        height: { xs: 40, md: 48 },
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        fontSize: { xs: "1rem", md: "1.2rem" },
                      }}
                    >
                      {item.isGroup
                        ? item.chatName.charAt(0).toUpperCase()
                        : otherUser?.name.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    {!item.isGroup &&
                      otherUser &&
                      onlineUser.has(otherUser?._id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 truncate text-xs md:text-sm group-hover:text-blue-700 transition-colors">
                        {item.isGroup
                          ? item.chatName
                          : otherUser?.name || "Unknown"}
                      </span>
                      {latestMessage && (
                        <span className="text-[10px] text-gray-400 ml-2 hidden sm:block">
                          {new Date(
                            latestMessage.createdAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {latestMessage && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs md:text-xs text-gray-500 truncate max-w-[180px] md:max-w-[220px]">
                          {item.isGroup && latestMessage.sender ? (
                            <b className="font-semibold mr-1">
                              {latestMessage.sender.name}:{" "}
                            </b>
                          ) : (
                            ""
                          )}
                          {latestMessage.content}
                        </span>
                        {item._id !== chat?._id &&
                          !item.latestMessage?.read.includes(user._id) && (
                            <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full opacity-100 transition-opacity"></div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AllChats;
