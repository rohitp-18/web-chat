"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Box from "@mui/material/Box";

function GroupInfo({}) {
  const { chat } = useSelector((state: RootState) => state.chat);

  if (!chat) return null;

  return (
    <Box className="mx-auto py-4 mt-20 border-0 outline-0 max-w-[90vw] md:max-w-[400px] bg-white rounded-lg shadow-xl flex flex-col justify-center items-center">
      <div className="p-4 w-full">
        <div className="text-xl font-bold text-center mb-4 text-gray-800">
          Group Info
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {chat.users &&
            chat.users.map((user) => (
              <div
                key={user._id}
                className="px-3 py-1 text-white text-sm rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                }}
              >
                {user.name}
              </div>
            ))}
        </div>
        <button
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          }}
          className="w-full py-2 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Update Group
        </button>
      </div>
    </Box>
  );
}

export default GroupInfo;
