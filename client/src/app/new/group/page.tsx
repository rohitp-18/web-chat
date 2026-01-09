"use client";

import Header from "@/components/Header";
import ProtectRoute from "@/components/ProtectRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/utils/loader";
import axios from "@/store/axios";
import { clearGroupState, createGroup, clearErrors } from "@/store/groupSlice";
import { AppDispatch, RootState } from "@/store/store";
import { user } from "@/store/types/userType";
import { findUsers } from "@/store/userSlice";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { isAxiosError } from "axios";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

function Page() {
  const [name, setName] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [availableUsername, setAvailableUsername] = useState<string>("");
  const [about, setAbout] = useState("");
  const [available, setAvailable] = useState<boolean | null>(false);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [membersId, setMembersId] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<user[]>([]);
  const [showUserList, setShowUserList] = useState(false);

  const { user, searchResults } = useSelector((root: RootState) => root.user);
  const { loading, success, error, group } = useSelector(
    (root: RootState) => root.group
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    if (about) {
      formData.append("about", about);
    }
    if (newAvatar) {
      formData.append("avatar", newAvatar);
    }
    membersId.forEach((memberId) => formData.append("members", memberId));

    dispatch(createGroup(formData));
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

  const storeSearchResults = useMemo(
    () => searchResults?.filter((user) => !membersId.includes(user._id)),
    [searchResults, membersId]
  );

  useEffect(() => {
    if (success) {
      toast.success("Group created successfully", {
        position: "top-center",
      });
      dispatch(clearGroupState());
      router.push(`/group/${group?._id}`);
    }
    if (error) {
      toast.error(error, {
        position: "top-center",
      });
      dispatch(clearErrors());
    }
  }, [success, error, dispatch, group, router]);

  useEffect(() => {
    if (memberInput) {
      dispatch(findUsers(memberInput));
    }
  }, [memberInput, dispatch]);

  if (!user) {
    return (
      <ProtectRoute>
        <Loader />
      </ProtectRoute>
    );
  }

  return (
    <ProtectRoute>
      <Header hidden={true} />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center items-center flex-col text-center">
          <h1 className="text-2xl font-bold mb-1">Create New Group</h1>
          <p className="text-gray-500">Start a new group conversation</p>
        </div>

        <form
          className="space-y-6 flex flex-col gap-1.5"
          onSubmit={handleSubmit}
        >
          {/* Avatar Section */}
          <div className="flex justify-center flex-col gap-2">
            <Label className="text-lg font-semibold">Group Picture</Label>
            <div className="flex items-center justify-center flex-col gap-4">
              <div className="relative" onClick={() => ref.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 hover:shadow-sm cursor-pointer">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar Preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400">
                      {name?.charAt(0)?.toUpperCase() || "G"}
                    </div>
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
                  Upload Group Photo
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
          <div className="flex justify-center flex-col gap-2">
            <Label htmlFor="name" className="text-lg font-semibold">
              Group Name
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="text-base"
              maxLength={50}
            />
          </div>

          <div className="flex justify-center flex-col gap-2">
            <Label htmlFor="username" className="text-lg font-semibold">
              Group Handle
            </Label>
            <div className="flex w-full sm:flex-row flex-col items-center gap-2">
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter group handle"
                className="text-base"
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

          <div className="flex justify-center flex-col gap-2">
            <Label className="text-lg font-semibold">Group Members</Label>
            <p className="text-gray-600 -mt-2 text-sm">
              You can add members after creating the group.
            </p>

            {members.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center bg-gray-100 px-1.5 py-1 rounded-full"
                  >
                    <Badge variant="secondary" className="px-1">
                      <Avatar className="w-5 h-5 mr-1">
                        <AvatarImage
                          src={member.avatar?.url}
                          alt={member.name}
                        />
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.name}
                    </Badge>
                    <IconButton
                      type="button"
                      onClick={() => {
                        setMembersId((prev) =>
                          prev.filter((id) => id !== member._id)
                        );
                        setMembers((prev) =>
                          prev.filter((user) => user._id !== member._id)
                        );
                      }}
                    >
                      <X className="w-3 h-3" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
            <Input
              type="text"
              placeholder="Search users to add"
              className="text-base"
              value={memberInput}
              onChange={(e) => {
                setMemberInput(e.target.value);
                setShowUserList(true);
              }}
              onFocus={() => setShowUserList(true)}
              onBlur={() => setTimeout(() => setShowUserList(false), 900)}
            />
            {showUserList && storeSearchResults && (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md mt-2">
                {storeSearchResults.length === 0 ? (
                  <p className="p-2 text-gray-500">No users found.</p>
                ) : (
                  storeSearchResults.map((foundUser) => (
                    <div
                      key={foundUser._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setMembersId((prev) => [...prev, foundUser._id]);
                        setMembers((prev) => [...prev, foundUser]);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                          <Avatar>
                            <AvatarImage
                              src={foundUser.avatar?.url}
                              alt={foundUser.name}
                            />
                            <AvatarFallback>
                              {foundUser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium">{foundUser.name}</p>
                          <p className="text-sm text-gray-500">
                            @{foundUser.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center flex-col gap-2">
            <Label htmlFor="about" className="text-lg font-semibold">
              About
            </Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Describe the group's purpose"
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
              Create Group
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
