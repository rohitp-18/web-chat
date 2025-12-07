"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, clearSuccess } from "@/store/chatSlice";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { registerUser } from "@/store/userSlice";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { user, success, error, loading } = useSelector(
    (state: RootState) => state.user
  );
  const router = useRouter();

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email && !password && !name) {
      alert("please fill all fields");
      return;
    }

    dispatch(registerUser({ name, email, password }));
  };
  useEffect(() => {
    if (success) {
      alert("registered successfully");
      dispatch(clearSuccess());
      router.push("/chat");
      return;
    }
    if (error) {
      alert(error);
      dispatch(clearErrors());
    }
  }, [dispatch, success, error, router]);

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-2">
      {loading ? (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-white shadow-2xl rounded-2xl px-4 py-4">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Create Account
              </h1>
              <p className="text-gray-600">Sign up to get started</p>
            </div>

            <form onSubmit={submitForm} className="space-y-4 p-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 outline-none"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-[1.02] transition duration-200 shadow-lg"
              >
                Create Account
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
