import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import NavbarComponent from "./NavbarComponent";

function ClaimHistoryPage() {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchClaimHistory(currentUser.uid);
      } else {
        setUser(null);
        setClaims([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchClaimHistory = async (userId) => {
    setLoading(true);
    try {
      const itemsCollection = collection(db, "barang_temuan");
      const q = query(itemsCollection, where("claims", "!=", null));
      const querySnapshot = await getDocs(q);

      const userClaims = [];
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const matchedClaims = item.claims.filter(
          (claim) => claim.user_id === userId
        );
        matchedClaims.forEach((claim) => {
          userClaims.push({
            ...claim,
            item_name: item.nama_barang,
            item_location: item.lokasi_ditemukan,
            item_date: item.tanggal_ditemukan,
            owner_contact: item.owner_contact, // Include contact information
            userWhatsapp: item.userWhatsapp,
          });
        });
      });

      console.log(userClaims);

      setClaims(userClaims);
    } catch (error) {
      console.error("Error fetching claim history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container md:mx-auto md:p-4">
      <NavbarComponent user={user} />
      <div className="px-4 md:px-0">
        <h1 className="text-2xl font-semibold mb-4">My Claim History</h1>
        {user ? (
          loading ? (
            <p>Loading...</p>
          ) : claims.length > 0 ? (
            <ul className="space-y-4">
              {claims.map((claim, index) => (
                <li
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 shadow-md"
                >
                  <h3 className="text-lg font-bold">{claim.item_name}</h3>
                  <p>
                    <strong>Location Found:</strong> {claim.item_location}
                  </p>
                  <p>
                    <strong>Date Found:</strong> {claim.item_date}
                  </p>
                  <p>
                    <strong>Claim Date:</strong>{" "}
                    {new Date(
                      claim.claim_date.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Score:</strong> {claim.score}%
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        claim.status === "approved"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {claim.status}
                    </span>
                  </p>
                  {claim.status === "approved" && (
                    <p className="mt-2">
                      <strong>Kontak Penemu:</strong>{" "}
                      <span className="text-blue-600">
                        <a
                          href={`https://wa.me/+62${claim.userWhatsapp.substring(
                            1
                          )}`}
                          target="_blank"
                        >
                          {claim.userWhatsapp}
                        </a>
                      </span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No claim history found.</p>
          )
        ) : (
          <p className="text-red-500">
            You must be logged in to view your claim history.
          </p>
        )}
      </div>
    </div>
  );
}

export default ClaimHistoryPage;
