"use client";

import { clearErrors, clearSuccess } from "@/store/userSlice";
import { AppDispatch, RootState } from "@/store/store";
import { loginUser } from "@/store/userSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, success, error, loading } = useSelector(
    (state: RootState) => state.user
  );

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const loginHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email && !password) {
      toast.error("Please fill all fields", { position: "top-center" });
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Logged in successfully", { position: "top-center" });
      dispatch(clearSuccess());
      router.push("/chat");
      return;
    }
    if (error) {
      toast.error(error, { position: "top-center" });
      dispatch(clearErrors());
    }
  }, [dispatch, success, error, router]);

  useEffect(() => {
    if (user) {
      if (success) return;
      router.push("/chat");
    }
  }, [user, success, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center sm:p-4 p-2">
      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl md:p-8 sm:p-6 p-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            <form
              onSubmit={(e) => loginHandler(e)}
              className="space-y-6 sm:p-3 py-3"
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
