import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  where,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import NavbarComponent from "./NavbarComponent";

function ReportLostItemPage() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [jenis_barang, setJenisBarang] = useState("");
  const [nama_barang, setNamaBarang] = useState("");
  const [lokasi_hilang, setLokasiHilang] = useState("");
  const [tanggal_hilang, setTanggalHilang] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);

  const lostItemsCollection = collection(db, "lost_items");

  useEffect(() => {
    const fetchData = async (user) => {
      const querySnapshot = await getDocs(
        query(lostItemsCollection, where("user_id", "==", user.uid))
      );
      setData(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      fetchData(currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !jenis_barang ||
      !nama_barang ||
      !lokasi_hilang ||
      !tanggal_hilang ||
      !deskripsi
    ) {
      alert("Please fill out all fields!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(lostItemsCollection, {
        user_id: user.uid,
        user_email: user.email,
        jenis_barang,
        nama_barang,
        lokasi_hilang,
        tanggal_hilang,
        deskripsi,
        report_date: new Date(),
      });
      alert("Lost item reported successfully!");
      // Reset form
      setJenisBarang("");
      setNamaBarang("");
      setLokasiHilang("");
      setTanggalHilang("");
      setDeskripsi("");
    } catch (error) {
      console.error("Error reporting lost item:", error);
      alert("An error occurred while reporting the lost item.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemFound = async (itemId) => {
    if (window.confirm("Are you sure this item has been found?")) {
      try {
        // Reference to the specific document
        const itemRef = doc(db, "lost_items", itemId);

        // Delete the document from Firestore
        await deleteDoc(itemRef);

        // Update local state instead of reloading the page
        setData((prevData) => prevData.filter((item) => item.id !== itemId));

        alert("Item successfully marked as found!");
      } catch (error) {
        console.error("Error marking item as found:", error);
        alert("An error occurred while marking the item as found.");
      }
    }
  };

  return (
    <div className="container md:mx-auto md:p-4">
      <NavbarComponent user={user} />
      <div className="px-4">
        <h1 className="text-2xl font-semibold mb-4">Report Lost Item</h1>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg font-medium mb-2">
                Jenis Barang
              </label>
              <select
                value={jenis_barang}
                onChange={(e) => setJenisBarang(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full"
              >
                <option value="">Select Jenis Barang</option>
                <option value="Dompet">Dompet</option>
                <option value="Tas">Tas</option>
                <option value="Hp">Hp</option>
                <option value="Kunci">Kunci</option>
                <option value="Atribut">Atribut</option>
                <option value="Buku">Buku</option>
                <option value="Laptop">Laptop</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Nama Barang
              </label>
              <input
                type="text"
                value={nama_barang}
                onChange={(e) => setNamaBarang(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full"
                placeholder="Enter the name of the item"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Lokasi Hilang
              </label>
              <input
                type="text"
                value={lokasi_hilang}
                onChange={(e) => setLokasiHilang(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full"
                placeholder="Enter the location where the item was lost"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Tanggal Hilang
              </label>
              <input
                type="date"
                value={tanggal_hilang}
                onChange={(e) => setTanggalHilang(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Deskripsi
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full"
                placeholder="Provide a detailed description of the item"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        ) : (
          <p className="text-red-500">
            You must be logged in to report a lost item.
          </p>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Lost Items</h2>

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No items lost.</p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-md rounded-lg overflow-hidden border"
              >
                <div className="p-4 flex flex-col md:flex-row">
                  <div className="flex-1 md:ml-4 mt-4 md:mt-0">
                    <h3 className="text-lg font-semibold">
                      {item.nama_barang}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <strong>Jenis Barang:</strong> {item.jenis_barang}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tanggal Ditemukan:</strong> {item.tanggal_hilang}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Lokasi Ditemukan:</strong> {item.lokasi_hilang}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Deskripsi:</strong> {item.deskripsi}
                    </p>
                  </div>

                  {/* Button "Sudah ditemukan" */}
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <button
                      onClick={() => handleItemFound(item.id)}
                      className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
                    >
                      Sudah ditemukan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportLostItemPage;
