/* eslint-disable react-hooks/rules-of-hooks */
import { Avatar } from "@mui/material";
import React, { useEffect, useState } from "react";
import Group from "./Group";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setChat } from "@/store/chatSlice";
import { chat } from "@/store/types/chatType";
import { useSocket } from "@/store/context/socketContext";

function AllChats() {
  const [group, setGroup] = useState(false);

  const { chats, chat, loading } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { onlineUser } = useSocket();

  const chatOpen = (item: chat) => {
    dispatch(setChat(item));
  };

  if (!chats || !user) {
    return null;
  }

  // useEffect(() => {
  //   console.log(chats.length, chatCount, socket);
  //   if (chats.length > 0 && chats.length !== chatCount && socket && user) {
  //     socket.emit("check_online_users", {
  //       users: [
  //         ...chats
  //           .filter((c) => !c.isGroup)
  //           .map((c) =>
  //             c.users[0]._id === user._id ? c.users[1]._id : c.users[0]._id
  //           ),
  //         user._id,
  //       ],
  //     });
  //     setChatCount(chats.length);
  //   }
  // }, [chatCount, chats, socket, user]);

  // useEffect(() => {
  //   console.log("line 47");
  //   if (socket && user) {
  //     socket.on("online_users", (data: { onlineUserIds: string[] }) => {
  //       setOnlineUsers(data.onlineUserIds);
  //       console.log(data);
  //     });
  //   }
  // }, [socket, user]);

  useEffect(() => {
    console.log(onlineUser);
  }, [onlineUser]);

  return (
    <div className="w-full md:min-w-[320px] md:max-w-[400px] bg-white rounded-none md:rounded-lg shadow-none md:shadow-lg p-3 md:p-4 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <span className="font-bold text-xl md:text-2xl text-gray-800">
          Chats
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setGroup(true)}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {group && <Group group={group} setGroup={setGroup} />}

      <div
        className="space-y-1 overflow-y-auto h-full"
        style={{ scrollbarWidth: "thin" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading chats...</span>
          </div>
        ) : !chats || chats.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-3">💬</div>
            <div className="text-gray-400 font-medium">No chats available</div>
            <div className="text-gray-300 text-sm mt-1">
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
                className={`flex items-center p-3 rounded-xl cursor-pointer hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-100 group ${
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
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontSize: { xs: "1rem", md: "1.2rem" },
                      }}
                    >
                      {item.isGroup
                        ? item.chatName.charAt(0).toUpperCase()
                        : otherUser?.name.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    {!item.isGroup &&
                      otherUser &&
                      !onlineUser.includes(otherUser?._id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 truncate text-sm md:text-base group-hover:text-blue-700 transition-colors">
                        {item.isGroup
                          ? item.chatName
                          : otherUser?.name || "Unknown"}
                      </span>
                      {latestMessage && (
                        <span className="text-xs text-gray-400 ml-2 hidden sm:block">
                          {new Date(
                            latestMessage.createdAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {latestMessage && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs md:text-sm text-gray-500 truncate max-w-[180px] md:max-w-[220px]">
                          {item.isGroup && latestMessage.sender
                            ? `${latestMessage.sender.name}: `
                            : ""}
                          {latestMessage.content}
                        </span>
                        <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
