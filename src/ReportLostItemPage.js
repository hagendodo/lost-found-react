import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import NavbarComponent from "./NavbarComponent";

function ReportLostItemPage() {
  const [user, setUser] = useState(null);
  const [jenis_barang, setJenisBarang] = useState("");
  const [nama_barang, setNamaBarang] = useState("");
  const [lokasi_hilang, setLokasiHilang] = useState("");
  const [tanggal_hilang, setTanggalHilang] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
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
      const lostItemsCollection = collection(db, "lost_items");
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

  return (
    <div className="container mx-auto p-4">
      <NavbarComponent user={user} />
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
            <label className="block text-lg font-medium mb-2">Deskripsi</label>
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
  );
}

export default ReportLostItemPage;
