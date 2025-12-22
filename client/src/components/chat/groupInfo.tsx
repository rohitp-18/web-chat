import { AppDispatch, RootState } from "@/store/store";
import Box from "@mui/material/Box";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Link from "next/link";
import { leaveGroup, userUnblockGroup } from "@/store/groupSlice";
import { updateGroupChat } from "@/store/chatSlice";

function GroupInfo() {
  const dispatch = useDispatch<AppDispatch>();
  const { chat } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.user);

  const isAdmin = useMemo(() => {
    if (chat?.group && user) {
      return chat.group.admins.some((admin) => admin === user._id);
    }
    return false;
  }, [chat, user]);

  const leaveHandler = () => {
    if (!chat?.group || !user) return;
    dispatch(leaveGroup(chat.group._id)).then((res) => {
      if (res.payload.success) {
        dispatch(
          updateGroupChat({
            ...chat,
            users: chat.users.filter((m) => m._id !== user?._id),
            oldUsers: chat.oldUsers.push(user._id),
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
      if (res.payload.success) {
        dispatch(
          updateGroupChat({
            ...chat,
            users: chat.users.push(user),
            oldUsers: chat.oldUsers.filter((m) => m !== user._id),
            group: {
              ...chat.group,
              members: chat.group?.members.filter((m) => m != user._id),
            },
          })
        );
      }
    });
  };

  const isMember = useMemo(
    () => chat?.group?.members.includes(user?._id || ""),
    [chat?.group, user?._id]
  );

  const isBlocked = useMemo(
    () => chat?.group && chat?.group.userBlocked.includes(user?._id || ""),
    [chat?.group, user?._id]
  );

  const isAdminBlocked = useMemo(
    () => chat?.group && chat?.group.blockedMembers.includes(user?._id || ""),
    [chat?.group, user?._id]
  );

  if (!chat?.group || !chat) {
    return null;
  }

  return (
    <Box className="mx-auto py-6 mt-20 border-0 outline-0 max-w-[90vw] md:max-w-[350px] bg-white rounded-lg shadow-xl flex flex-col justify-center items-center">
      <Box className="flex flex-col justify-center items-center p-4">
        <Avatar className="w-20 h-20 mb-2 text-white text-2xl">
          <AvatarImage src={chat.group.avatar?.url} alt={chat.group.name} />
          <AvatarFallback
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            }}
          >
            {chat.group.name.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-bold text-xl text-gray-800">{chat.group.name}</h1>
        <p className="text-gray-500 mt-1">@{chat.group.username}</p>
        <span className="text-gray-400 text-sm my-3">
          {chat.group.members.length} Members
        </span>
        <div className="flex justify-between mt-6 items-center space-x-2">
          <Button asChild>
            <Link href={`/group/${chat.group._id}`}>View Profile</Link>
          </Button>
          {isMember && !isAdmin && (
            <Button variant="outline" onClick={leaveHandler}>
              Leave Group
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href={`/group/${chat.group._id}/add-users`}>Add Users</Link>
            </Button>
          )}
          {isBlocked && (
            <Button variant="outline" onClick={unblockHandler}>
              Unblock Group
            </Button>
          )}
        </div>
        {isAdminBlocked && (
          <div className="text-red-400 font-semibold mt-4 opacity-70">
            Admin blocked you
          </div>
        )}
      </Box>
    </Box>
  );
}

export default GroupInfo;
