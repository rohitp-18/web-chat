"use client";

import ProtectRoute from "@/components/ProtectRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/utils/loader";
import axios from "@/store/axios";
import { clearErrors, clearSuccess } from "@/store/chatSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Edit } from "@mui/icons-material";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

function Page() {
  const [name, setName] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [availableUsername, setAvailableUsername] = useState<string>("");
  const [about, setAbout] = useState("");
  const [available, setAvailable] = useState<boolean | null>(true);
  const [availableLoading, setAvailableLoading] = useState(false);

  const { user } = useSelector((root: RootState) => root.user);
  const { chat, loading, success, error } = useSelector(
    (root: RootState) => root.chat
  );

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const { id } = useParams();

  const availabilityCheck = async () => {
    if (username === user?.username) {
      setAvailable(null);
      return;
    }
    setAvailableLoading(true);
    try {
      const { data } = await axios.get(
        `/user/username-status?username=${username}`
      );
      setAvailable(data.available);
      setAvailableUsername(username || "");
    } catch (error: unknown) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : "An unexpected error occurred",
        {
          position: "top-center",
        }
      );
    }
    setAvailableLoading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (availableUsername && username !== availableUsername && !available) {
      toast.error("Please choose an available username", {
        position: "top-center",
      });
      return;
    }

    if (!name || !username) {
      toast.error("Please fill all required fields", {
        position: "top-center",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("about", about);
    if (newAvatar) {
      formData.append("avatar", newAvatar);
    }
  };

  const uploadAvatar = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files === null) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
      setNewAvatar(e.target.files[0]);
    },
    [setAvatarPreview]
  );

  useEffect(() => {
    if (chat && user && chat.chatUsername !== id) {
      if (chat.admin._id !== user._id) {
        toast.error("You are not authorized to edit this group", {
          position: "top-center",
        });
        router.push(`/group/${id}`);
      }
    }
  }, [chat, id, router, user]);

  useEffect(() => {
    if (chat) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(chat.chatName || "");
      setUsername(chat.chatUsername || "");
      setAbout(chat.about || "");
      setAvatarPreview(chat.avatar?.url || null);
    }
  }, [chat]);

  useEffect(() => {
    if (success) {
      toast.success("Group details updated successfully", {
        position: "top-center",
      });
      router.push(`/group/${id}`);
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error, {
        position: "top-center",
      });
      dispatch(clearErrors());
    }
  }, [success, router, username, error, dispatch, id]);

  if (!user) {
    return (
      <ProtectRoute>
        <Loader />
      </ProtectRoute>
    );
  }

  return (
    <ProtectRoute>
      <Link href={`/group/${id}`} className="text-blue-500 hover:underline">
        &larr; Back to Group
      </Link>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center items-center flex-col text-center">
          <h1 className="text-2xl font-bold mb-1">Edit Group Details</h1>
          <p className="text-gray-500">Update your Group information</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="flex justify-center flex-col gap-4">
            <Label className="text-lg font-semibold">Profile Picture</Label>
            <div className="flex items-center justify-center flex-col gap-4">
              <div className="relative" onClick={() => ref.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 hover:shadow-sm cursor-pointer">
                  {!newAvatar && !avatarPreview ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage src={user?.avatar?.url} alt={user?.name} />
                      <AvatarFallback className="text-2xl bg-gray-100">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Image
                      src={
                        avatarPreview ||
                        (newAvatar ? URL.createObjectURL(newAvatar) : "")
                      }
                      alt="Avatar Preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                    <Edit className="text-white" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => ref.current?.click()}
                >
                  Upload Photo
                </Button>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={uploadAvatar}
                  ref={ref}
                  className="hidden"
                  aria-label="Upload avatar"
                />
              </div>
            </div>
          </div>

          {/* Name Section */}
          <div className="flex justify-center flex-col gap-4">
            <Label htmlFor="name" className="text-lg font-semibold">
              Full Name
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="text-base"
              maxLength={50}
            />
          </div>

          <div className="flex justify-center flex-col gap-4">
            <Label htmlFor="username" className="text-lg font-semibold">
              Username
            </Label>
            <div className="flex w-full sm:flex-row flex-col items-center gap-2">
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="text-base bg-gray-100"
                maxLength={30}
              />
              <Button
                type="button"
                variant="outline"
                onClick={availabilityCheck}
              >
                Check Availability
              </Button>
            </div>
            {availableLoading ? (
              <p className="text-sm text-gray-600">Checking availability...</p>
            ) : (
              available !== null && (
                <p
                  className={`text-sm ${
                    available ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {available
                    ? "Username is available"
                    : "Username is not available"}
                </p>
              )
            )}
          </div>

          <div className="flex justify-center flex-col gap-4">
            <Label htmlFor="about" className="text-lg font-semibold">
              About
            </Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell us about yourself"
              className="text-base"
              maxLength={160}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 px-8"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </ProtectRoute>
  );
}

export default Page;
