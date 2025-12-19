import Header from "@/components/Header";
import ProtectRoute from "@/components/ProtectRoute";
import { Button } from "@/components/ui/button";
import { Group, Person } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

function Page() {
  return (
    <ProtectRoute>
      <Header chat={false} />
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Start a New Conversation
            </h1>
            <p className="text-gray-600">
              Choose how you&apos;d like to connect
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/new/user" className="block p-2">
              <Button className="w-full flex items-center justify-start p-10 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
                  <Person
                    className="text-blue-600"
                    sx={{ width: 24, height: 24 }}
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Individual Chat</h3>
                  <p className="text-sm text-gray-500">
                    Start a private conversation
                  </p>
                </div>
              </Button>
            </Link>

            <Link href="/new/group" className="block">
              <Button className="w-full flex items-center justify-start p-10 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
                  <Group
                    className="text-green-600"
                    sx={{ width: 24, height: 24 }}
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Group Chat</h3>
                  <p className="text-sm text-gray-500">
                    Create a group conversation
                  </p>
                </div>
              </Button>
            </Link>

            {/* <Link href="/new/join" className="block">
              <Button className="w-full flex items-center justify-start p-10 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mr-4">
                  <Search
                    className="text-purple-600"
                    sx={{ width: 24, height: 24 }}
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Join Group</h3>
                  <p className="text-sm text-gray-500">
                    Find and join existing groups
                  </p>
                </div>
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </ProtectRoute>
  );
}

export default Page;
