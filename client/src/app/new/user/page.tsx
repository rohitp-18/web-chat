"use client";

import Header from "@/components/Header";
import ProtectRoute from "@/components/ProtectRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppDispatch, RootState } from "@/store/store";
import { findUsers } from "@/store/userSlice";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function Page() {
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { searchResults } = useSelector((state: RootState) => state.user);
  const {} = useSelector((state: RootState) => state.chat);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    dispatch(findUsers(searchQuery));
  }

  useEffect(() => {
    if (searchQuery !== "") {
      dispatch(findUsers(searchQuery));
    }
  }, [searchQuery, dispatch]);

  return (
    <ProtectRoute>
      <Header chat={false} />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex items-center border-b border-gray-300 py-2">
              <input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
              >
                Search
              </button>
            </div>
          </form>
          <div>
            {searchResults && searchResults.length === 0 ? (
              <p className="text-gray-500 text-center">No users found.</p>
            ) : (
              <ul>
                {searchResults &&
                  searchResults.map((user) => (
                    <li
                      key={user._id}
                      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
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
                          <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                      </Link>
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
