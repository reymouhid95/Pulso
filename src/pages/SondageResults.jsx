import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  refreshAccessTokenAsync,
  selectToken,
  selectUserId,
} from "../components/features/AuthSlice";
import AllInOne from "./AllInOne";
import { useParams } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";

const SondageResults = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({});
  const [question, setQuestion] = useState("");
  const token = useSelector(selectToken);
  const user_id = useSelector(selectUserId);
  const { sondageId } = useParams();
  const [votes, setVotes] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!token || !sondageId) {
          console.log(
            "Pas de Token ou de sondageId. Impossible de voir les resultats"
          );
          return;
        }

        const headers = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const sondageResponse = await axios.get(
          `https://pulso-backend.onrender.com/api/sondages/${sondageId}/`,
          headers
        );

        const Votes = await axios.get(
          `https://pulso-backend.onrender.com/api/sondages/${sondageId}/resultats/`,
          headers
        );
        setVotes(Votes.data.answers);
        setLoading(false);

        setResult(sondageResponse.data);
        setQuestion(sondageResponse.data.question);
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);

        if (error.response && error.response.status === 401) {
          const refreshResponse = await dispatch(refreshAccessTokenAsync());
          const newAccessToken = refreshResponse.payload.access;

          if (newAccessToken) {
            const headers = {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            };

            const Votes = await axios.get(
              `https://pulso-backend.onrender.com/api/sondages/${sondageId}/resultats/`,
              headers
            );
            setVotes(Votes.data);
            console.log(Votes.data.answers);
            setLoading(false);

            const sondageResponse = await axios.get(
              `https://pulso-backend.onrender.com/api/sondages/${sondageId}/`,
              headers
            );

            setResult(sondageResponse.data);
            setQuestion(sondageResponse.data.question);
            setLoading(false);
          } else {
            console.error("Error lors du rafraichissement du token");
          }
        }
      }
    };

    fetchResults();
  }, [token, user_id, sondageId, dispatch]);

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
        <h3 className="text-gray-500 text-4xl font-black mt-12 text-center">
          Nombre de Votes : {votes.length}
        </h3>
      </div>
    </div>
  );
};

export default SondageResults;
