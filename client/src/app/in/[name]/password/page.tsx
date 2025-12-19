"use client";

import ProtectRoute from "@/components/ProtectRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/utils/loader";
import { RootState } from "@/store/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "@/store/axios";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

function Page() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  async function submitHandler(e: React.FormEvent) {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all the fields", { position: "top-center" });
      return;
    }

    if (!user) {
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New Password and Confirm Password do not match", {
        position: "top-center",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New Password must be at least 8 characters long", {
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put("/api/v1/user/update/password", {
        oldPassword,
        newPassword,
      });
      toast.success(data.message, { position: "top-center" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push(`/in/${user.username}`);
      }, 1500);
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data.message : "Internal Error",
        {
          position: "top-center",
        }
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <ProtectRoute>
        <Loader />
      </ProtectRoute>
    );
  }
  return (
    <ProtectRoute>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <Link
            href="/in/account"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Account
          </Link>
          <h1 className="text-2xl font-bold mb-6 text-center">
            Change Password
          </h1>

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder="Enter your old password"
                className="mt-1"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                className="mt-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                className="mt-1"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={loading} className="w-full mt-6">
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectRoute>
  );
}

export default Page;
