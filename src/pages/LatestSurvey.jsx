/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectToken, selectUserId } from "../components/features/AuthSlice";

const LatestSurvey = () => {
  const [latestSurvey, setLatestSurvey] = useState(null);
  const token = useSelector(selectToken);
  const userId = useSelector(selectUserId);

  useEffect(() => {
    const fetchLatestSurvey = async () => {
      try {
        const response = await axios.get(
          `https://pulso-backend.onrender.com/api/sondages/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setLatestSurvey(response.data);
      } catch (error) {
        console.error("Error fetching latest survey:", error);
      }
    };

    if (token && userId) {
      fetchLatestSurvey();
    }
  }, [token, userId]);

  return (
    <div className="text-center font-sans mt-20">
      {latestSurvey && (
        <div>
          <p>Titre : {latestSurvey.question}</p>
          <p>Options :</p>
          <ul>
            {latestSurvey.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
      )}
      {!latestSurvey && (
        <p className="text-gray-400 text-2xl font-bold">
          Aucun sondage récent n'a été trouvé pour cet utilisateur.
        </p>
      )}
    </div>
  );
};

export default LatestSurvey;
