"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Close } from "@mui/icons-material";
import { Message } from "@/store/types/chatType";

interface NotificationProps {
  data: Message;
  onClose: () => void;
}

const CustomNotification: React.FC<NotificationProps> = ({ data, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white border flex justify-between items-center z-1000 border-gray-200 rounded-lg shadow-lg p-4 max-w-sm w-full transition-all duration-300 ease-in-out ${
        isExiting
          ? "opacity-0 translate-x-full"
          : "opacity-100 translate-x-0 animate-in slide-in-from-right"
      } hover:shadow-xl cursor-pointer transform hover:scale-105`}
    >
      <Link href={"/chat"} className="flex flex-1 items-center gap-3">
        <div className="flex items-start gap-3">
          {data.sender?.avatar?.url && (
            <Avatar className="shrink-0">
              <AvatarImage src={data.sender.avatar.url} />
              <AvatarFallback>
                {data.sender.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {data.sender.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {data.content}
            </p>
          </div>
        </div>
      </Link>

      <Button
        variant={"outline"}
        size={"icon"}
        className="shrink-0 h-6 w-6 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
      >
        <Close sx={{ width: "12px", height: "12px" }} />
      </Button>
    </div>
  );
};

export default CustomNotification;
