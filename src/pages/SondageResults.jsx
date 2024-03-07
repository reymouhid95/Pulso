/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  refreshAccessTokenAsync,
  selectToken,
  selectUserId,
} from "../components/features/AuthSlice";
import AllInOne from "../components/AllInOne";
import { useParams } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";

const SondageResults = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({});
  const [question, setQuestion] = useState("");
  const [votes, setVotes] = useState(0);
  const token = useSelector(selectToken);
  const user_id = useSelector(selectUserId);
  const { sondageId } = useParams();
  const dispatch = useDispatch();

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

      const [sondageResponse, votesResponse] = await Promise.all([
        axios.get(
          `https://pulso-backend.onrender.com/api/sondages/${sondageId}/`,
          headers
        ),
        axios.get(
          `https://pulso-backend.onrender.com/api/sondages/${sondageId}/resultats/`,
          headers
        ),
      ]);

      setVotes(votesResponse.data.answers);
      console.log("Nombre de votes", votesResponse.data.answers.length);
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

          const [sondageResponse, votesResponse] = await Promise.all([
            axios.get(
              `https://pulso-backend.onrender.com/api/sondages/${sondageId}/`,
              headers
            ),
            axios.get(
              `https://pulso-backend.onrender.com/api/sondages/${sondageId}/resultats/`,
              headers
            ),
          ]);

          setVotes(votesResponse.data);
          console.log(votesResponse.data.answers);
          setLoading(false);

          setResult(sondageResponse.data);
          setQuestion(sondageResponse.data.question);
          setLoading(false);
        } else {
          console.error("Error lors du rafraichissement du token");
        }
      }
    }
  };

  useEffect(() => {
    fetchResults();
    const intervalId = setInterval(fetchResults, 1000);
    return () => clearInterval(intervalId);
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

  const getColorClass = (percentage) => {
    if (percentage >= 75) {
      return "bg-green-500";
    } else if (percentage >= 50) {
      return "bg-yellow-500";
    } else if (percentage >= 25) {
      return "bg-orange-500";
    } else {
      return "bg-red-500";
    }
  };

  const graphiqueOptionBar = Object.keys(pourcentageOptions).map((option) => (
    <div
      key={option}
      className="mb-4 text-gray-500 font-bold hover:text-gray-600"
    >
      <div className="flex items-center mb-2">
        <div className="w-1/4 text-right pr-4">{option}</div>
        <div className="w-1/2 bg-gray-200 h-6 rounded-full overflow-hidden">
          <div
            className={`h-full ${getColorClass(
              (pourcentageOptions[option] / totalVotes) * 100
            )}`}
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
          Votes : {votes.length}
        </h3>
      </div>
    </div>
  );
};

export default SondageResults;
