"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function HomePage() {
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.user);

  const handleGetStarted = () => {
    if (user) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-indigo-600">WebChat</div>
        <div className="space-x-4">
          {user ? (
            <button
              onClick={() => router.push("/chat")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Go to Chat
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Connect Instantly with{" "}
          <span className="text-indigo-600">WebChat</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Experience seamless real-time messaging with friends, family, and
          colleagues. Join conversations, share moments, and stay connected
          wherever you are.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-10 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Messaging</h3>
            <p className="text-gray-600">
              Instant message delivery with live typing indicators
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              End-to-end encryption keeps your conversations safe
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="text-lg font-semibold mb-2">Global Access</h3>
            <p className="text-gray-600">
              Chat from anywhere on any device, anytime
            </p>
          </div>
        </div>

        <button
          onClick={handleGetStarted}
          className="bg-indigo-600 text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg"
        >
          {user ? "Start Chatting" : "Get Started"}
        </button>

        <p className="text-gray-500 mt-4">
          {user
            ? "Continue your conversations"
            : "Join thousands of users already chatting"}
        </p>
      </div>
    </div>
  );
}
