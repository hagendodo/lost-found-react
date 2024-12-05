import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to Lost & Found</h2>
          <p className="text-gray-700 mb-6">
            Your trusted platform to report, claim, and manage lost or found
            items.
          </p>
          <div className="space-x-4">
            <Link
              to="/report"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Report Found Item
            </Link>
            <Link
              to="/search"
              className="px-6 py-2 bg-gray-200 text-teal-600 rounded-lg hover:bg-gray-300 transition"
            >
              Search Lost Items
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4">
        <p>
          © 2024 Lost & Found. Built with ❤️ by{" "}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:text-teal-500 transition"
          >
            anak if
          </a>
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
