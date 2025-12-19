"use client";

import Header from "@/components/Header";
import ProtectRoute from "@/components/ProtectRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Loader from "@/components/utils/loader";
import { createChat } from "@/store/chatSlice";
import { AppDispatch, RootState } from "@/store/store";
import { getUserProfile, logoutUser } from "@/store/userSlice";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, user } = useSelector((root: RootState) => root.user);
  const { success, error, loading } = useSelector(
    (root: RootState) => root.chat
  );
  const { name } = useParams();
  const router = useRouter();

  async function sendMessage(userId: string) {
    dispatch(createChat(userId)).then(() => {
      toast.success("Chat created successfully", {
        duration: 3000,
        position: "top-center",
      });
      router.push(`/chat`);
    });
  }

  useEffect(() => {
    if (!name || !user) return;
    dispatch(getUserProfile(name as string));
  }, [name, dispatch, user]);

  useEffect(() => {
    if (success) {
      return;
    }
    if (error) {
      toast.error(error, {
        duration: 3000,
        position: "top-center",
      });
    }
  }, [success, error, router]);

  if (!profile || !user) {
    return (
      <ProtectRoute>
        <Loader />
      </ProtectRoute>
    );
  }

  return (
    <ProtectRoute>
      <Header />
      <div className="max-w-2xl md:min-h-screen min-h-[calc(100vh-70px)] mx-auto p-6 md:p-2 flex justify-between flex-col">
        {/* Profile Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center sm:flex-row flex-col gap-8 pb-8 pt-10">
            <Avatar className="w-24 h-24 shrink-0">
              <AvatarImage src={profile.avatar?.url} alt={profile.name} />
              <AvatarFallback>
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 sm:min-w-0 min-w-full">
              <h1 className="text-3xl font-bold mb-2 truncate">
                {profile.name}
              </h1>
              <span className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                @{profile.username}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-600">
              {profile.about || "No about available."}
            </p>
          </div>

          <div className="w-full flex items-center justify-between">
            {profile._id === user._id ? (
              <Link className="w-full flex" href={`/in/${user.username}/edit`}>
                <Button variant="default" className="flex-1 ml-2">
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <Button
                disabled={loading}
                onClick={() => sendMessage(profile._id)}
                variant="default"
                className="flex-1 mr-2"
              >
                Send Message
              </Button>
            )}
          </div>
        </div>

        {/* Additional Actions */}
        {profile._id === user._id && (
          <div className="mt-8 pt-8 border-t space-y-2">
            <Link className="w-full" href={`/in/${user.username}/edit`}>
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:bg-red-50"
              >
                Change Password
              </Button>
            </Link>
            <Button
              onClick={() => dispatch(logoutUser())}
              variant="ghost"
              className="w-full text-red-600 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </ProtectRoute>
  );
}

export default Page;
