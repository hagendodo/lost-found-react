import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "./firebaseConfig";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SearchPage from "./SearchPage";
import ReportPage from "./ReportPage";
import HomePage from "./HomePage";
import ReportLostItemPage from "./ReportLostItemPage";

function App() {
  const [user, setUser] = useState(null);

  const login = async () => {
    try {
      // Set 'prompt' to 'select_account' to always show account picker
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, googleProvider);
      const emailDomain = result.user.email.split("@")[1];
      if (emailDomain !== "student.uinsgd.ac.id") {
        alert("Only emails from student.uinsgd.ac.id are allowed!");
        await signOut(auth);
      } else {
        setUser(result.user);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const emailDomain = currentUser.email.split("@")[1];
        if (emailDomain === "student.uinsgd.ac.id") {
          setUser(currentUser);
        } else {
          signOut(auth);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-teal-600 mb-8">
          Lost Found FST
        </h1>
        {!user ? (
          <button
            onClick={login}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
          >
            Login with Google
          </button>
        ) : (
          <button
            onClick={logout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
          >
            Logout
          </button>
        )}
        <div className="w-full max-w-4xl mt-8">
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  <HomePage />
                ) : (
                  <div className="text-center text-gray-700 mt-4">
                    <p>Please log in to access the page.</p>
                  </div>
                )
              }
            />
            <Route path="/report-lost-item" element={<ReportLostItemPage />} />
            <Route
              path="/report"
              element={
                user ? (
                  <ReportPage />
                ) : (
                  <div className="text-center text-gray-700 mt-4">
                    <p>Please log in to access the page.</p>
                  </div>
                )
              }
            />
            <Route
              path="/search"
              element={
                user ? (
                  <SearchPage />
                ) : (
                  <div className="text-center text-gray-700 mt-4">
                    <p>Please log in to access the page.</p>
                  </div>
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
