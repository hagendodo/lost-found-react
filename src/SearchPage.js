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
  deleteDoc,
} from "firebase/firestore";
import { addDays, format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import NavbarComponent from "./NavbarComponent";
import { Navigate } from "react-router-dom";

const QuizModal = ({ answers, onSubmit, onClose }) => {
  const [userAnswers, setUserAnswers] = useState({});

  // Handle selection of answers
  const handleAnswerChange = (questionIndex, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  // Calculate the score and submit
  const handleSubmit = () => {
    let correctCount = 0;

    answers.forEach((item, index) => {
      if (userAnswers[index] === item.selectedAnswer) {
        correctCount += 1;
      }
    });

    const totalQuestions = answers.length;
    const percentageScore = (correctCount / totalQuestions) * 100;

    onSubmit(percentageScore);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Answer the Questions</h2>

        <div className="space-y-4">
          {answers.map((item, index) => (
            <div key={index} className="mb-4">
              <p className="font-medium">{item.question}</p>
              <div className="space-y-2">
                {item.options.map((option, optIndex) => (
                  <label key={optIndex} className="block">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={() => handleAnswerChange(index, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

function SearchPage() {
  const [jenis_barang, setJenisBarang] = useState("");
  const [lostDate, setLostDate] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [hasReported, setHasReported] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [whatsapp, setWhatsApp] = useState("");

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const fetchUserData = async () => {
        if (currentUser) {
          setUser(currentUser);
          setUserId(currentUser.uid);
          await checkUserReportStatus(currentUser.uid);

          try {
            // Fetch WhatsApp data
            const userDocRef = doc(db, "data_users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              setWhatsApp(userDoc.data().whatsapp);
            } else {
              console.log("No user document found.");
            }
          } catch (error) {
            console.error("Error fetching user document:", error);
          }
        } else {
          setUser(null);
          setUserId(null);
          setHasReported(false);
          setWhatsApp("");
        }
      };

      fetchUserData();
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [auth, db]);

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
            !item.claims.some((claim) => claim.status == "step2") ||
            !item.claims.some((claim) => claim.user_id == userId)
        );
      setItems(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimApproval = (item) => {
    setCurrentItem(item);
    setIsQuizOpen(true);
  };

  const handleQuizSubmit = async (score) => {
    setIsQuizOpen(false);

    if (score >= 80) {
      try {
        const itemDocRef = doc(db, "barang_temuan", currentItem.id);
        await updateDoc(itemDocRef, {
          claims: arrayUnion({
            user_id: userId,
            claim_date: new Date(),
            status: "step2",
            userWhatsapp: user.whatsapp,
            score: score,
          }),
        });

        alert("Claim approved");
        window.location.href = "/claims";
      } catch (error) {
        const itemDocRef = doc(db, "barang_temuan", currentItem.id);
        await updateDoc(itemDocRef, {
          claims: arrayUnion({
            user_id: userId,
            claim_date: new Date(),
            status: "declined",
            userWhatsapp: user.whatsapp,
            score: score,
          }),
        });
        window.location.href = "/search";
        console.error("Error approving claim:", error);
      }
    } else {
      alert("Your answers were not sufficient to approve the claim.");
    }
  };

  return (
    <div className="container md: mx-auto md:p-4">
      {isQuizOpen && currentItem && (
        <QuizModal
          answers={currentItem.answers}
          onSubmit={handleQuizSubmit}
          onClose={() => setIsQuizOpen(false)}
        />
      )}

      <NavbarComponent user={user} />
      <div className="px-4">
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
              Report a lost item
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
                    <button
                      onClick={() => handleClaimApproval(item)}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Approve Claim
                    </button>
                  </li>
                ))
              ) : (
                <p>No items found.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
