"use client";

import ProtectRoute from "@/components/ProtectRoute";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useParams, useRouter } from "next/navigation";
import { getGroupDetails, setChat } from "@/store/chatSlice";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function Page() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { chat, loading } = useSelector((state: RootState) => state.chat);

  const sendMessage = () => {
    router.push(`/chat`);
  };

  useEffect(() => {
    if (!user || !id) {
      return;
    }

    dispatch(getGroupDetails(id as string));
  }, [user, dispatch, id]);

  const isAdmin = useMemo(
    () =>
      chat &&
      user &&
      chat.admin &&
      chat.admin._id === user._id &&
      chat._id === id,
    [chat, user, id]
  );

  const admin = useMemo(() => {
    if (!chat || !user) {
      return null;
    }
    return chat.admin;
  }, [chat, user]);

  if (!user || !chat || !admin) {
    return null;
  }

  return (
    <ProtectRoute>
      <Header />
      <div className="max-w-2xl md:min-h-screen min-h-[calc(100vh-70px)] mx-auto p-6 md:p-2 flex justify-between flex-col">
        {/* Profile Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center sm:flex-row flex-col gap-8 pb-8 pt-10">
            <Avatar className="w-24 h-24 shrink-0">
              <AvatarImage src={chat.avatar?.url} alt={chat.chatName} />
              <AvatarFallback>
                {chat.chatName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 sm:min-w-0 min-w-full">
              <h1 className="text-3xl font-bold mb-2 truncate">
                {chat.chatName}
              </h1>
              <span className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                @{chat.chatUsername}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-600">
              {chat.about || "No about available."}
            </p>
          </div>

          <div className="w-full flex items-center justify-between">
            {admin._id === user._id ? (
              <Link
                className="w-full flex"
                href={`/group/${id as string}/edit`}
              >
                <Button variant="default" className="flex-1 ml-2">
                  Edit Group
                </Button>
              </Link>
            ) : (
              chat.users.includes(user) && (
                <Button
                  disabled={loading}
                  onClick={() => sendMessage()}
                  variant="default"
                  className="flex-1 mr-2"
                >
                  Send Message
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </ProtectRoute>
  );
}

export default Page;
