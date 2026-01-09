import { AppDispatch, RootState } from "@/store/store";
import { user } from "@/store/types/userType";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  blockChat,
  clearErrors,
  clearSuccess,
  unblockChat,
} from "@/store/chatSlice";
import { toast } from "sonner";
import { useSocket } from "@/store/context/socketContext";

function ChatInfo() {
  const [otherUser, setOtherUser] = useState<user | null>(null);
  const [blocked, setBlocked] = useState<boolean>(false);

  const { socket } = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const { chat, success, error, loading, message } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.user);

  const blockUser = () => {
    if (!blocked) {
      dispatch(blockChat(chat?._id || ""));
      socket?.emit("block user", {
        chatId: chat?._id,
        blockedBy: user,
        userId: otherUser?._id,
      });
    } else {
      dispatch(unblockChat(chat?._id || ""));
      socket?.emit("unblock user", {
        chatId: chat?._id,
        blockedBy: null,
        userId: otherUser?._id,
      });
    }
  };

  useEffect(() => {
    if (chat && !chat.isGroup) {
      const other = chat.users.find((u) => u._id !== user?._id) || null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOtherUser(other);
      setBlocked(chat.blockedChat);
    }
  }, [chat, user]);

  useEffect(() => {
    if (success) {
      toast.success(message || "", {
        position: "top-center",
      });
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error, {
        position: "top-center",
      });
      dispatch(clearErrors());
    }
  }, [dispatch, success, error, blocked, message]);

  if (!otherUser || !chat) {
    return null;
  }

  return (
    <Box className="mx-auto py-6 mt-20 border-0 outline-0 max-w-[90vw] md:max-w-[350px] bg-white rounded-lg shadow-xl flex flex-col justify-center items-center">
      <Box className="flex flex-col justify-center items-center p-4">
        <Avatar className="w-20 h-20 mb-2 bg-blue-500 text-2xl">
          <AvatarImage src={otherUser.avatar?.url} alt={otherUser.name} />
          <AvatarFallback
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            }}
          >
            {otherUser.name.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-bold text-xl text-gray-800">{otherUser.name}</h1>
        <p className="text-gray-500 mt-1">{otherUser.username}</p>

        <div className="flex justify-between mt-6 items-center space-x-2">
          <Button asChild>
            <Link href={`/in/${otherUser.username}`}>View Profile</Link>
          </Button>
          {(!chat.blockedChat ||
            (chat.blockedBy && chat.blockedBy._id === user?._id)) && (
            <Button disabled={loading} onClick={blockUser} variant={"outline"}>
              {blocked ? "UnBlock User" : "Block User"}
            </Button>
          )}
        </div>
      </Box>
    </Box>
  );
}

export default ChatInfo;
