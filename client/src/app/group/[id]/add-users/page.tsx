"use client";

import Header from "@/components/Header";
import ProtectRoute from "@/components/ProtectRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loader from "@/components/utils/loader";
import {
  clearGroupState,
  clearErrors,
  addUsersToGroup,
  getGroupDetails,
} from "@/store/groupSlice";
import { AppDispatch, RootState } from "@/store/store";
import { user } from "@/store/types/userType";
import { findUsers } from "@/store/userSlice";
import { Box, IconButton } from "@mui/material";
import { X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

function Page() {
  const [membersId, setMembersId] = useState<string[]>([]);
  const [members, setMembers] = useState<user[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, searchResults } = useSelector((root: RootState) => root.user);
  const { loading, success, error, group, message } = useSelector(
    (root: RootState) => root.group
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = useParams();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!group) return;

    dispatch(findUsers(searchQuery));
  };

  const handleAddMember = (newMember: user) => {
    if (membersId.includes(newMember._id)) return;
    setMembersId((prev) => [...prev, newMember._id]);
    setMembers((prev) => [...prev, newMember]);
  };

  const handleAddMemberInGroup = () => {
    if (!group) return;
    if (loading) return;
    dispatch(addUsersToGroup({ groupId: group._id, userIds: membersId }));
  };

  const storeSearchResults = useMemo(() => {
    if (!group || !searchResults) return null;
    const users = [
      ...group.members.map((member) => member._id),
      ...group.admins.map((admin) => admin._id),
      ...membersId,
    ];
    return searchResults.filter((user) => !users.includes(user._id));
  }, [searchResults, membersId, group]);

  const blockedUsersIds = useMemo(() => {
    if (!user || !group) return [];
    return group?.userBlocked.map((blockedUser) => blockedUser._id);
  }, [user, group]);

  const adminBlockedUsersIds = useMemo(() => {
    if (!user || !group) return [];
    return group?.blockedMembers.map((blockedUser) => blockedUser._id);
  }, [user, group]);

  useEffect(() => {
    if (success) {
      toast.success(message, {
        position: "top-center",
      });
      dispatch(clearGroupState());
      router.push(`/group/${id as string}`);
    }
    if (error) {
      toast.error(error, {
        position: "top-center",
      });
      dispatch(clearErrors());
    }
  }, [success, error, message, dispatch, id, router]);

  useEffect(() => {
    if (!group || group._id !== id) {
      dispatch(getGroupDetails(id as string));
    }
    if (group && group._id === id) {
      if (group.admins.every((admin) => admin._id !== user?._id)) {
        router.push(`/group/${group._id}`);
      }
    }
  }, [group, id, router, user, dispatch]);

  if (!user || !group) {
    return (
      <ProtectRoute>
        <Loader />
      </ProtectRoute>
    );
  }

  return (
    <ProtectRoute>
      <Header chat={false} />
      <div className="flex flex-col items-center gap-2 justify-center min-h-screen p-6 bg-linear-to-br from-blue-50 to-indigo-100">
        <Box className="mx-auto py-2 mt-20 min-w-64 border-0 outline-0 max-w-[90vw] md:max-w-[350px] bg-white rounded-lg shadow-xl flex flex-col justify-start items-start">
          <Box className="flex justify-center items-center p-4 gap-4">
            <Avatar className="w-16 h-16 mb-2 text-white text-2xl">
              <AvatarImage src={group.avatar?.url} alt={group.name} />
              <AvatarFallback
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                }}
              >
                {group.name.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-center">
              <h1 className="font-bold text-xl text-gray-800">{group.name}</h1>
              <p className="text-gray-500 -mt-1">@{group.username}</p>
              <span className="text-gray-400 text-sm mt-1">
                {group.members.length} Members
              </span>
            </div>
          </Box>
          <div className="flex justify-between p-2 w-full items-center space-x-2">
            <Button variant={"outline"} asChild className="flex-1">
              <Link href={`/group/${group._id}`}>View Profile</Link>
            </Button>
          </div>
        </Box>
        <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-lg">
          <form onSubmit={handleSearch} className="mb-6">
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
            <div className="flex items-center border-b border-gray-300 py-2">
              <input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              />
              <Button type="submit" variant="ghost" disabled={loading}>
                Search
              </Button>
            </div>
            <Button className="mt-4 flex-1" onClick={handleAddMemberInGroup}>
              Add Members
            </Button>
          </form>
          <div>
            {storeSearchResults && storeSearchResults.length === 0 ? (
              <p className="text-gray-500 text-center">No users found.</p>
            ) : (
              <ul>
                {storeSearchResults &&
                  storeSearchResults.map((user) => (
                    <li
                      key={user._id}
                      className="p-4 border-b flex justify-between items-center border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <Link
                        href={`/in/${user.username}`}
                        className="flex items-center"
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar?.url} alt={user.name} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex flex-row items-center space-x-4">
                          <p className="text-gray-900 font-medium">
                            {user.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            @{user.username}
                          </p>
                          {blockedUsersIds.includes(user._id) ||
                          adminBlockedUsersIds.includes(user._id) ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : null}
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => {}} variant="outline">
                          <Link href={`/in/${user.username}`}>View</Link>
                        </Button>
                        {blockedUsersIds.includes(user._id) ||
                        adminBlockedUsersIds.includes(user._id) ? null : (
                          <Button
                            onClick={() => handleAddMember(user)}
                            variant="default"
                            className="ml-auto"
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectRoute>
  );
}

export default Page;
