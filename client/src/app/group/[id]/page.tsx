"use client";

import ProtectRoute from "@/components/ProtectRoute";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { clearErrors, clearSuccess, getGroupDetails } from "@/store/groupSlice";
import { Separator } from "@/components/ui/separator";
import MemberUser from "@/components/group/memberUser";
import { toast } from "sonner";

function Page() {
  const [button, setButton] = useState<string>("members");

  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { group, loading, success, error, message } = useSelector(
    (state: RootState) => state.group
  );

  const sendMessage = () => {
    router.push(`/chat`);
  };

  useEffect(() => {
    if (success) {
      toast.success(message, {
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
  }, [success, error, dispatch, id, message]);

  useEffect(() => {
    if (!user || !id) {
      return;
    }

    dispatch(getGroupDetails(id as string));
  }, [user, dispatch, id]);

  const admin = useMemo(() => {
    if (!group || !user) {
      return null;
    }
    return group.admins.find((admin) => admin._id === user._id) || null;
  }, [group, user]);

  if (!user || !group || !admin) {
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
              <AvatarImage src={group.avatar?.url} alt={group.name} />
              <AvatarFallback>
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 sm:min-w-0 min-w-full">
              <h1 className="text-3xl font-bold mb-2 truncate">{group.name}</h1>
              <span className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                @{group.username}
              </span>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-gray-600">
              {group.about || "No about available."}
            </p>
          </div>
          <div className="w-full flex items-center justify-between gap-5">
            {admin._id === user._id && (
              <Button variant="default" className="flex-1 ml-2">
                <Link
                  className="w-full flex justify-center items-center"
                  href={`/group/${id as string}/edit`}
                >
                  Edit Group
                </Link>
              </Button>
            )}
            {group.members.findIndex((member) => member._id === user._id) !==
              -1 && (
              <Button
                disabled={loading}
                onClick={() => sendMessage()}
                variant={admin._id === user._id ? "outline" : "default"}
                className="flex-1 mr-2"
              >
                Send Message
              </Button>
            )}
            {group.admins.findIndex((member) => member._id === user._id) !==
              -1 && (
              <Button
                disabled={loading}
                variant={"default"}
                className="flex-1 mr-2"
              >
                <Link href={`/group/${id}/add-users`}>Add-Users</Link>
              </Button>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-evenly items-center gap-3">
            <Button
              onClick={() => setButton("members")}
              variant={button === "members" ? "default" : "outline"}
              className="flex-1"
              size={"sm"}
            >
              Members
            </Button>
            <Button
              onClick={() => setButton("admins")}
              variant={button === "admins" ? "default" : "outline"}
              className="flex-1"
              size={"sm"}
            >
              Admins
            </Button>
            {admin && (
              <>
                <Button
                  onClick={() => setButton("blocked")}
                  variant={button === "blocked" ? "default" : "outline"}
                  className="flex-1"
                  size={"sm"}
                >
                  Blocked
                </Button>
                <Button
                  onClick={() => setButton("user-block")}
                  variant={button === "user-block" ? "default" : "outline"}
                  className="flex-1"
                  size={"sm"}
                >
                  User Blocked
                </Button>
              </>
            )}
          </div>
          <div className="mt-6">
            {button === "members" &&
              (group.members.length === 0 ? (
                <p className="text-center text-gray-500">No members found.</p>
              ) : (
                group.members.map((member) => (
                  <Fragment key={member._id}>
                    <MemberUser
                      member={member}
                      isAdmin={admin ? admin._id === user._id : false}
                    />
                  </Fragment>
                ))
              ))}
            {button === "admins" &&
              (group.admins.length === 0 ? (
                <p className="text-center text-gray-500">No admins found.</p>
              ) : (
                group.admins.map((a) => (
                  <Fragment key={a._id}>
                    <MemberUser
                      member={a}
                      isAdmin={admin ? admin._id === user._id : false}
                    />
                  </Fragment>
                ))
              ))}
            {button === "blocked" &&
              (group.blockedMembers.length === 0 ? (
                <p className="text-center text-gray-500">
                  No blocked members found.
                </p>
              ) : (
                group.blockedMembers.map((blocked) => (
                  <Fragment key={blocked._id}>
                    <MemberUser
                      member={blocked}
                      isAdmin={admin._id === user._id}
                    />
                  </Fragment>
                ))
              ))}
            {button === "user-block" &&
              (group.userBlocked.length === 0 ? (
                <p className="text-center text-gray-500">
                  No user blocked members found.
                </p>
              ) : (
                group.userBlocked.map((blocked) => (
                  <Fragment key={blocked._id}>
                    <MemberUser
                      member={blocked}
                      isAdmin={admin._id === user._id}
                    />
                  </Fragment>
                ))
              ))}
          </div>
        </div>
      </div>
    </ProtectRoute>
  );
}

export default Page;
