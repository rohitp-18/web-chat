"use client";

import { user } from "@/store/types/userType";
import React, { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import {
  adminBlockUser,
  adminUnblockUser,
  removeUsersFromGroup,
  toggleAdminStatus,
} from "@/store/groupSlice";
import { toast } from "sonner";

function MemberUser({ member, isAdmin }: { member: user; isAdmin: boolean }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { group } = useSelector((state: RootState) => state.group);
  const { user } = useSelector((state: RootState) => state.user);

  const isMemberAdmin = useMemo(
    () => group && group.admins.find((admin) => admin._id === member._id),
    [group, member._id]
  );

  const isMember = useMemo(
    () => group && group.members.find((m) => m._id === member._id),
    [group, member._id]
  );

  const isBlocked = useMemo(
    () =>
      group && group.userBlocked.find((blocked) => blocked._id === member._id),
    [group, member._id]
  );

  const isAdminBlocked = useMemo(
    () =>
      group &&
      group.blockedMembers.find((blocked) => blocked._id === member._id),
    [group, member._id]
  );

  const blockHandler = () => {
    if (isBlocked) {
      toast.error("User is already blocked from the group", {
        position: "top-center",
      });
      return;
    }

    if (!isAdmin) {
      toast.error("Only admins can block users", { position: "top-center" });
      return;
    }

    if (isAdminBlocked) {
      dispatch(adminUnblockUser({ groupId: group!._id, userId: member._id }));
    } else {
      dispatch(adminBlockUser({ groupId: group!._id, userId: member._id }));
    }
  };

  const adminHandler = () => {
    if (!isAdmin) {
      toast.error("Only admins can change admin status", {
        position: "top-center",
      });
      return;
    }

    dispatch(
      toggleAdminStatus({
        groupId: group!._id,
        userId: member._id,
        makeAdmin: !isMemberAdmin,
      })
    );
  };

  if (!group || !user) {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-2 border-b">
      <div className="flex items-center gap-4 mb-2">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={member.avatar?.url} alt={member.name} />
          <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-start items-start gap-0">
          <h2 className="text-base font-medium">{member.name}</h2>
          <p className="text-sm -mt-0.5 text-gray-500">{member.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        {!isBlocked && (
          <DropdownMenu
            onOpenChange={(val) => setDropdownOpen(val)}
            open={dropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                {isAdmin && member._id !== user._id && (
                  <>
                    {isMember && (
                      <DropdownMenuItem
                        onClick={() =>
                          dispatch(
                            removeUsersFromGroup({
                              groupId: group._id,
                              userIds: [member._id],
                            })
                          )
                        }
                      >
                        Remove User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={blockHandler}>
                      {isAdminBlocked ? "Unblock User" : "Block User"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={adminHandler}>
                      {isMemberAdmin ? "Remove Admin" : "Make Admin"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <Link href={`/profile/${member._id}`}>View Profile</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default MemberUser;
