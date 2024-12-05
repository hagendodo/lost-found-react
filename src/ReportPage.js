import React, { useState, useEffect } from "react";
import { db, storage, auth } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import questionTemplates from "./questionsTemplate.json"; // Import the template JSON
import NavbarComponent from "./NavbarComponent";

function ReportPage() {
  const [data, setData] = useState([]);
  const [jenisBarang, setJenisBarang] = useState("Dompet");
  const [namaBarang, setNamaBarang] = useState("");
  const [fotoBarang, setFotoBarang] = useState(null);
  const [tanggalDitemukan, setTanggalDitemukan] = useState("");
  const [lokasiDitemukan, setLokasiDitemukan] = useState("");
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [customAnswers, setCustomAnswers] = useState([]); // Array to hold answers
  const [loading, setLoading] = useState(false);

  const dataCollection = collection(db, "barang_temuan");

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
      } else {
        setUser(null);
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const dataSnapshot = await getDocs(dataCollection);
      setData(dataSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchData();
  }, []);

  // Generate dynamic questions based on selected jenisBarang
  const generateQuestions = (jenisBarang) => {
    if (jenisBarang === "Lainnya") {
      // Custom form for 'Lainnya'
      setDynamicQuestions([
        {
          question: "Custom Question 1",
          options: ["Option 1", "Option 2", "Option 3"],
        },
        {
          question: "Custom Question 2",
          options: ["Option 1", "Option 2", "Option 3"],
        },
        {
          question: "Custom Question 3",
          options: ["Option 1", "Option 2", "Option 3"],
        },
        {
          question: "Custom Question 4",
          options: ["Option 1", "Option 2", "Option 3"],
        },
        {
          question: "Custom Question 5",
          options: ["Option 1", "Option 2", "Option 3"],
        },
      ]);
    } else {
      setDynamicQuestions(questionTemplates[jenisBarang] || []);
    }

    // Reset custom answers for newly generated questions
    setCustomAnswers(new Array(dynamicQuestions.length).fill("")); // Initialize with empty answers
  };

  // Handle input change for custom answers
  const handleCustomAnswerChange = (index, value) => {
    const updatedAnswers = [...customAnswers];
    updatedAnswers[index] = value;
    setCustomAnswers(updatedAnswers);
  };

  // Handle changes in radio option text
  const handleOptionChange = (questionIndex, optionIndex, newValue) => {
    const updatedQuestions = [...dynamicQuestions];
    updatedQuestions[questionIndex].options[optionIndex] = newValue;
    setDynamicQuestions(updatedQuestions);
  };

  // Handle question text change
  const handleQuestionChange = (index, newQuestionText) => {
    const updatedQuestions = [...dynamicQuestions];
    updatedQuestions[index].question = newQuestionText;
    setDynamicQuestions(updatedQuestions);
  };

  // Handle form submission
  const addData = async () => {
    if (!userId) {
      alert("User not authenticated!");
      return;
    }

    setLoading(true);

    try {
      let fotoUrl = "";
      if (fotoBarang) {
        const fotoRef = ref(storage, `images/${fotoBarang.name}`);
        await uploadBytes(fotoRef, fotoBarang);
        fotoUrl = await getDownloadURL(fotoRef);
      }

      // Get the answers and options
      const answers = dynamicQuestions.map((q, index) => ({
        question: q.question,
        selectedAnswer: customAnswers[index] || "",
        options: q.options,
      }));

      // Add data to Firestore
      await addDoc(dataCollection, {
        jenis_barang: jenisBarang,
        nama_barang: namaBarang,
        foto_barang: fotoUrl,
        tanggal_ditemukan: tanggalDitemukan,
        lokasi_ditemukan: lokasiDitemukan,
        userId,
        userEmail: user.email,
        answers,
      });

      // Reset fields after submission
      setJenisBarang("Dompet");
      setNamaBarang("");
      setFotoBarang(null);
      setTanggalDitemukan("");
      setLokasiDitemukan("");
      setDynamicQuestions([]);
      setCustomAnswers([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Update question template for Lainnya
  useEffect(() => {
    generateQuestions(jenisBarang);
  }, [jenisBarang]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const q = query(dataCollection, where("userId", "==", userId));
        const dataSnapshot = await getDocs(q);
        const fetchedData = dataSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarComponent user={user} />

      {/* Content */}
      <div className="flex flex-col items-center p-6">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          {/* Jenis Barang */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Jenis Barang
            </label>
            <select
              value={jenisBarang}
              onChange={(e) => setJenisBarang(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-300"
            >
              <option>Dompet</option>
              <option>Tas</option>
              <option>Hp</option>
              <option>Kunci</option>
              <option>Atribut</option>
              <option>Buku</option>
              <option>Laptop</option>
              <option>Lainnya</option>
            </select>
          </div>

          {/* Existing Fields */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Nama Barang
            </label>
            <input
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Foto Barang
            </label>
            <input
              type="file"
              onChange={(e) => setFotoBarang(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Tanggal Ditemukan
            </label>
            <input
              type="date"
              value={tanggalDitemukan}
              onChange={(e) => setTanggalDitemukan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Lokasi Ditemukan
            </label>
            <input
              type="text"
              value={lokasiDitemukan}
              onChange={(e) => setLokasiDitemukan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-300"
            />
          </div>

          {/* Render dynamic questions */}
          {dynamicQuestions.map((q, questionIndex) => (
            <div key={questionIndex} className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {/* Editable question text */}
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                />
              </label>
              <div className="space-x-2">
                {q.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={option}
                      checked={customAnswers[questionIndex] === option}
                      onChange={() =>
                        handleCustomAnswerChange(questionIndex, option)
                      }
                      className="form-radio"
                    />
                    {/* Editable option */}
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button
              onClick={addData}
              className={`px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="w-5 h-5 mr-2 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                    stroke="currentColor"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 118 8 8 8 0 01-8-8z"
                  ></path>
                </svg>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Found Items</h2>

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-md rounded-lg overflow-hidden border"
              >
                <div className="p-4 flex flex-col md:flex-row">
                  <div className="flex-shrink-0">
                    <img
                      src={item.foto_barang}
                      alt="Foto Barang"
                      className="w-full md:w-48 h-auto rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1 md:ml-4 mt-4 md:mt-0">
                    <h3 className="text-lg font-semibold">
                      {item.nama_barang}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <strong>Jenis Barang:</strong> {item.jenis_barang}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tanggal Ditemukan:</strong>{" "}
                      {item.tanggal_ditemukan}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Lokasi Ditemukan:</strong> {item.lokasi_ditemukan}
                    </p>
                    <details className="mt-4">
                      <summary className="text-teal-600 cursor-pointer">
                        {item.claims && item.claims.length > 0
                          ? `View ${item.claims.length} Claim(s)`
                          : "No claims"}
                      </summary>
                      {item.claims && item.claims.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {item.claims.map((claim, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 p-2 rounded-md border"
                            >
                              <p className="text-sm">
                                <strong>User ID:</strong> {claim.user_id}
                              </p>
                              <p className="text-sm">
                                <strong>Date:</strong>{" "}
                                {new Date(
                                  claim.claim_date.toMillis()
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm">
                                <strong>Score:</strong> {claim.score}
                              </p>
                              <p className="text-sm">
                                <strong>Status:</strong> {claim.status}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
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

export default ReportPage;
