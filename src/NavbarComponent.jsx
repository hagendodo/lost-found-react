import React from "react";

export default function NavbarComponent({ user }) {
  return (
    <nav className="bg-teal-600 text-white px-4 py-2 flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold">
          <a href="/">Beranda</a>
        </h1>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <img
            src={
              user.photoURL || "https://via.placeholder.com/150?text=No+Profile"
            }
            alt="User profile"
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <span className="text-sm">
            {user.displayName || "No Name Provided"}
          </span>
        </div>
      )}
    </nav>
  );
}
