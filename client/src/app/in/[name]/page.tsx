"use client";

import ProtectRoute from "@/components/ProtectRoute";
import { AppDispatch, RootState } from "@/store/store";
import { getUserProfile } from "@/store/userSlice";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((root: RootState) => root.user);
  const { name } = useParams();

  useEffect(() => {
    if (!name) return;
    dispatch(getUserProfile(name as string));
  }, [name, dispatch]);
  return (
    <ProtectRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Change Photo
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                Update Profile
              </button>
            </div>
          </div>

          {/* Username Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Username Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Username
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                  {user?.username || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Username
                </label>
                <input
                  type="text"
                  placeholder="Enter new username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Username must be unique and 3-20 characters long
                </p>
              </div>

              <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                Change Username
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                Change Password
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Two-Factor Authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectRoute>
  );
}

export default Page;
