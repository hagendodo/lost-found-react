import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { addDays, format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import NavbarComponent from "./NavbarComponent";

function SearchPage() {
  const [jenis_barang, setJenisBarang] = useState("");
  const [lostDate, setLostDate] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [questionnaire, setQuestionnaire] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [hasReported, setHasReported] = useState(false);

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        checkUserReportStatus(currentUser.uid);
      } else {
        setUser(null);
        setUserId(null);
        setHasReported(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkUserReportStatus = async (userId) => {
    try {
      const lostItemsCollection = collection(db, "lost_items");
      const q = query(lostItemsCollection, where("user_id", "==", userId));
      const querySnapshot = await getDocs(q);

      setHasReported(!querySnapshot.empty);
    } catch (error) {
      console.error("Error checking report status:", error);
    }
  };

  const handleSearch = async () => {
    if (!jenis_barang || !lostDate || !hasReported) return;

    setLoading(true);
    const dataCollection = collection(db, "barang_temuan");
    const startDate = format(addDays(new Date(lostDate), -7), "yyyy-MM-dd");
    const endDate = format(addDays(new Date(lostDate), 7), "yyyy-MM-dd");

    const q = query(
      dataCollection,
      where("jenis_barang", "==", jenis_barang),
      where("tanggal_ditemukan", ">=", startDate),
      where("tanggal_ditemukan", "<=", endDate)
    );

    try {
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
        .filter(
          (item) =>
            !item.claims ||
            !item.claims.some((claim) => claim.user_id === userId)
        ); // Filter out items where user ID exists in claims
      setItems(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <NavbarComponent user={user} />
      <h1 className="text-2xl font-semibold mb-4">Search Items</h1>

      {hasReported ? (
        <>
          {/* Search Filters */}
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">
              Choose Jenis Barang:
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

          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">
              Select Lost Date:
            </label>
            <input
              type="date"
              value={lostDate}
              onChange={(e) => setLostDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </>
      ) : (
        <p className="text-red-500">
          You must report a lost item before you can search. Please go to the
          report page to register your lost item.{" "}
          <a href="/report-lost-item" className="underline">
            Report an lost item
          </a>
        </p>
      )}

      {/* Search Results */}
      <div className="mt-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <li key={item.id} className="border-b py-2">
                  <h3 className="font-medium">{item.nama_barang}</h3>
                  <p>Lokasi Ditemukan: {item.lokasi_ditemukan}</p>
                  <p>Tanggal Ditemukan: {item.tanggal_ditemukan}</p>
                  {item.foto_barang && (
                    <img
                      src={item.foto_barang}
                      alt="Item"
                      className="mt-2 w-32 h-32 object-cover"
                    />
                  )}
                </li>
              ))
            ) : (
              <p>No items found.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
