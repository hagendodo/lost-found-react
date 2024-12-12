import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

function WhatsAppNumberPage({ user, setHasWhatsApp }) {
  const [whatsapp, setWhatsApp] = useState("");

  const saveWhatsAppNumber = async () => {
    if (!whatsapp.trim()) {
      alert("Please enter a valid WhatsApp number.");
      return;
    }

    try {
      const userDocRef = doc(db, "data_users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        name: user.displayName,
        whatsapp: whatsapp,
        photoURL: user.photoURL,
      });
      setHasWhatsApp(true);
      alert("WhatsApp number saved successfully.");
    } catch (error) {
      console.error("Error saving WhatsApp number:", error);
      alert("Failed to save WhatsApp number.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Add WhatsApp Number</h1>
      <input
        type="text"
        value={whatsapp}
        onChange={(e) => setWhatsApp(e.target.value)}
        placeholder="Enter WhatsApp Number"
        className="p-2 border border-gray-300 rounded-lg w-full mb-4"
      />
      <button
        onClick={saveWhatsAppNumber}
        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
      >
        Save
      </button>
    </div>
  );
}

export default WhatsAppNumberPage;
