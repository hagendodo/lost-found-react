import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "./firebaseConfig";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import SearchPage from "./SearchPage";
import ReportPage from "./ReportPage";
import HomePage from "./HomePage";
import ReportLostItemPage from "./ReportLostItemPage";
import ClaimHistoryPage from "./ClaimHistoryPage";
import WhatsAppNumberPage from "./WhatsappNumberPage";

function App() {
  const [user, setUser] = useState(null);
  const [hasWhatsApp, setHasWhatsApp] = useState(false);
  const [fetching, setFetching] = useState(true);

  const login = async () => {
    try {
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, googleProvider);
      const emailDomain = result.user.email.split("@")[1];
      // if (emailDomain !== "student.uinsgd.ac.id") {
      //   alert("Only emails from student.uinsgd.ac.id are allowed!");
      //   await signOut(auth);
      // } else {
      //   const userDocRef = doc(db, "data_users", result.user.uid);
      //   const userDoc = await getDoc(userDocRef);

      //   if (userDoc.exists() && userDoc.data().whatsapp) {
      //     setHasWhatsApp(true);
      //   } else {
      //     setHasWhatsApp(false);
      //   }

      //   setUser(result.user);
      // }

      const userDocRef = doc(db, "data_users", result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().whatsapp) {
        setHasWhatsApp(true);
      } else {
        setHasWhatsApp(false);
      }

      setUser(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
    setHasWhatsApp(false);
  };

  useEffect(() => {
    setFetching(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const emailDomain = currentUser.email.split("@")[1];
        // if (emailDomain === "student.uinsgd.ac.id") {
        //   const userDocRef = doc(db, "data_users", currentUser.uid);
        //   const userDoc = await getDoc(userDocRef);

        //   if (userDoc.exists() && userDoc.data().whatsapp) {
        //     setHasWhatsApp(true);
        //   } else {
        //     setHasWhatsApp(false);
        //   }

        //   setUser(currentUser);
        // } else {
        //   signOut(auth);
        // }

        const userDocRef = doc(db, "data_users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().whatsapp) {
          setHasWhatsApp(true);
        } else {
          setHasWhatsApp(false);
        }

        setUser(currentUser);
      }
    });
    setFetching(false);
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-teal-600 mb-8">
          Lost Found FST
        </h1>
        {!user ? (
          !fetching ? (
            <button
              onClick={login}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
            >
              Login with Google Student Account
            </button>
          ) : (
            <></>
          )
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
                  hasWhatsApp ? (
                    <HomePage />
                  ) : (
                    <Navigate to="/add-whatsapp" />
                  )
                ) : !fetching ? (
                  <div className="text-center text-gray-700 mt-4">
                    <p>Please log in to access the page.</p>
                  </div>
                ) : (
                  <></>
                )
              }
            />
            <Route
              path="/claims"
              element={
                user && hasWhatsApp ? (
                  <ClaimHistoryPage />
                ) : (
                  <Navigate to="/add-whatsapp" />
                )
              }
            />
            <Route
              path="/report-lost-item"
              element={
                !fetching ? (
                  user && hasWhatsApp ? (
                    <ReportLostItemPage />
                  ) : (
                    <Navigate to="/add-whatsapp" />
                  )
                ) : (
                  <></>
                )
              }
            />
            <Route
              path="/report"
              element={
                user && hasWhatsApp ? (
                  <ReportPage />
                ) : (
                  <Navigate to="/add-whatsapp" />
                )
              }
            />
            <Route
              path="/search"
              element={
                user && hasWhatsApp ? (
                  <SearchPage />
                ) : (
                  <Navigate to="/add-whatsapp" />
                )
              }
            />
            <Route
              path="/add-whatsapp"
              element={
                user ? (
                  <WhatsAppNumberPage
                    user={user}
                    setHasWhatsApp={setHasWhatsApp}
                  />
                ) : (
                  <Navigate to="/" />
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
