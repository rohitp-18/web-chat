import Link from "next/link";
import React from "react";

function NotFound() {
  return (
    <div className="flex flex-col items-center max-h-dvh justify-center min-h-screen bg-linear-to-br from-white to-blue-50">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          404
        </h1>
        <div className="space-y-2">
          <p className="text-3xl font-semibold text-gray-800">Page Not Found</p>
          <p className="text-gray-500 max-w-md mx-auto">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
