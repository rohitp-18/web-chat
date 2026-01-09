"use client";

import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import NotificationMiddle from "./notificationMiddle";

function ProtectRoute(props: { children: React.ReactNode }) {
  const { user, loading } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, router, loading]);

  return (
    <div className="md:ml-16 ml-0">
      {user && <NotificationMiddle>{props.children}</NotificationMiddle>}
    </div>
  );
}

export default ProtectRoute;
