import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUserId } from "../components/features/AuthSlice";
import { selectLienSondageStockes } from "../components/features/SondageSlices";
import { Toaster, toast } from "sonner";
import AllInOne from "./AllInOne";
import { useParams } from "react-router-dom";
import axios from "axios";
import LinearProgress from "@mui/material/LinearProgress";

const ShareLink = () => {
  const token = useSelector(selectToken);
  const userId = useSelector(selectUserId);
  const liensSondages = useSelector(selectLienSondageStockes);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const { sondageId } = useParams();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);

        if (!token || !sondageId) {
          console.log(
            "Pas de Token ou de sondageId. Impossible de voir les resultats"
          );
          return;
        }

        const sondageResponse = await axios.get(
          `https://pulso-backend.onrender.com/api/sondages/${sondageId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setQuestion(sondageResponse.data.question);
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [token, sondageId]);

  const userLiensSondages = liensSondages.filter(
    (lien) => lien.owner == userId && lien.sondageId == sondageId
  );

  const handleCopy = (lien, index) => {
    if (lien && token) {
      navigator.clipboard.writeText(lien);
      setCopiedIndex(index);
      toast.success("Lien copié!");
      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } else {
      console.error("Utilisateur pas authentifié ou pas de lien disponible");
      toast.error("Utilisateur pas authentifié ou pas de lien disponible!");
    }
  };

  return (
    <div>
      <AllInOne />
      <div className="mt-40 font-sans">
        <h1 className="text-gray-500 text-4xl font-black mb-10 text-center">
          {question}
        </h1>
        <div className="mt-10 flex items-center justify-center">
          <Toaster position="top-left" />
          {loading ? (
            <LinearProgress />
          ) : userLiensSondages.length > 0 && token ? (
            <div>
              {userLiensSondages.map((lien, index) => (
                <div key={index} className="mb-4">
                  <input
                    value={lien.lien}
                    disabled
                    className="p-3 ms-5"
                    style={{ minWidth: "430px" }}
                  />
                  <button
                    onClick={() => handleCopy(lien.lien, index)}
                    className={`ml-2 bg-slate-600 text-white px-4 py-1 rounded-md ${
                      copiedIndex === index ? "opacity-50" : ""
                    }`}
                    disabled={copiedIndex !== null}
                  >
                    {copiedIndex === index ? "Copié!" : "Copier"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-2xl font-bold">
              Pas de lien disponible. Créez un sondage avant.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
