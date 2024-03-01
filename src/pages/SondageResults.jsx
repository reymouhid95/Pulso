import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectToken, selectUserId } from "../components/features/AuthSlice";
import AllInOne from "./AllInOne";
import { useParams } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";

const SondageResults = () => {
  const [loading, setLoading] = useState(true); // État pour le chargement
  const [result, setResult] = useState({});
  const [question, setQuestion] = useState("");
  const token = useSelector(selectToken);
  const user_id = useSelector(selectUserId);
  const { sondageId } = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      try {
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

        setResult(sondageResponse.data);
        setQuestion(sondageResponse.data.question);
        setLoading(false); // Mettre le chargement à false une fois les données reçues
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchResults();
  }, [token, user_id, sondageId]);

  if (!token) {
    return (
      <div>
        <AllInOne />
        <div className="text-center text-gray-400 text-2xl font-bold mt-40">
          Veuillez vous connecter pour voir les résultats.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      // Afficher le loader pendant le chargement
      <div>
        <AllInOne />
        <LinearProgress />
      </div>
    );
  }

  if (!result) {
    return (
      <div>
        <AllInOne />
        <div className="text-center text-gray-400 text-2xl font-bold mt-40">
          Aucun résultat disponible pour ce sondage.
        </div>
      </div>
    );
  }

  const { answers } = result;

  const pourcentageOptions = {};
  if (Array.isArray(answers)) {
    answers.forEach((answer) => {
      const choix = answer.choix;
      pourcentageOptions[choix] = (pourcentageOptions[choix] || 0) + 1;
    });
  } else {
    // console.error("Answers is not an array:", answers);
  }

  const totalVotes = answers ? answers.length : 0;

  const optionPlusElevee = Object.keys(pourcentageOptions).reduce(
    (a, b) => (pourcentageOptions[a] > pourcentageOptions[b] ? a : b),
    ""
  );

  const graphiqueOptionBar = Object.keys(pourcentageOptions).map((option) => (
    <div
      key={option}
      className="mb-4 text-gray-500 font-bold hover:text-gray-600"
    >
      <div className="flex items-center mb-2">
        <div className="w-1/4 text-right pr-4">{option}</div>
        <div className="w-1/2 bg-gray-200 h-6 rounded-full overflow-hidden">
          <div
            className={`h-full bg-blue-500 ${
              option === optionPlusElevee ? "most-frequent" : ""
            }`}
            style={{
              width: `${(pourcentageOptions[option] / totalVotes) * 100}%`,
            }}
          ></div>
        </div>
        <div className="w-1/4 pl-4 text-gray-600">
          {Math.round((pourcentageOptions[option] / totalVotes) * 100)}%
        </div>
      </div>
    </div>
  ));

  return (
    <div>
      <AllInOne />
      <div className="mt-40 flex-col mb-10">
        <h1 className="text-gray-500 text-4xl font-black mb-10 text-center">
          {question}
        </h1>
        <div className="options-container">{graphiqueOptionBar}</div>
      </div>
    </div>
  );
};

export default SondageResults;
