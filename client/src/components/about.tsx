import React from "react";

function About() {
  return (
    <section className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Welcome to Chat App
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Select a conversation to start messaging or create a new group to
          connect with multiple people.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Real-time messaging</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Group conversations</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Secure & private</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span>Easy to use</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
