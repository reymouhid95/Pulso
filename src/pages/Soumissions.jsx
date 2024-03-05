/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { selectLienSondageStockes } from "../components/features/SondageSlices";
import {
  refreshAccessTokenAsync,
  selectToken,
  selectUserId,
  setToken,
} from "../components/features/AuthSlice";
import AllInOne from "./AllInOne";
import { useParams } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";

const Soumissions = () => {
  const [soumissions, setSoumissions] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const token = useSelector(selectToken);
  const user_id = useSelector(selectUserId);
  const lienSondagesStockes = useSelector(selectLienSondageStockes);
  const dispatch = useDispatch();

  const { sondageId } = useParams();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        if (!token || !sondageId) {
          console.log(
            "Pas de Token ou d'ID de sondage. Impossible de voir les soumissions"
          );
          return;
        }

        const sondage = lienSondagesStockes.find(
          (s) => s.sondageId == sondageId
        );
        console.log(sondage);

        const headers = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        try {
          const response = await axios.get(
            `https://pulso-backend.onrender.com/api/sondages/${sondageId}/resultats/`,
            headers
          );

          setSoumissions(response.data.answers);

          const sondageResponse = await axios.get(
            `https://pulso-backend.onrender.com/api/sondages/${sondageId}/`,
            headers
          );

          setQuestion(sondageResponse.data.question);
        } catch (error) {
          if (error.response.status === 401) {
            const refreshResponse = await dispatch(refreshAccessTokenAsync());
            const newAccessToken = refreshResponse.payload.access;
            localStorage.setItem("accessToken", newAccessToken);

            dispatch(
              setToken({
                access: newAccessToken,
                user_id: localStorage.getItem("user_id"),
                expiry: refreshResponse.payload.expiry,
              })
            );

            if (newAccessToken) {
              headers.headers.Authorization = `Bearer ${newAccessToken}`;
              const response = await axios.get(
                `https://pulso-backend.onrender.com/api/sondages/${sondageId}/resultats/`,
                headers
              );

              setSoumissions(response.data.answers);

              const sondageResponse = await axios.get(
                `https://pulso-backend.onrender.com/api/sondages/${sondageId}/`,
                headers
              );

              setQuestion(sondageResponse.data.question);
            } else {
              console.error("Erreur lors du rafraichissement du token");
            }
          } else {
            console.error("Erreur:", error);
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [sondageId, token, user_id, lienSondagesStockes, dispatch]);

  if (loading) {
    return (
      <div>
        <AllInOne />
        <LinearProgress />
      </div>
    );
  }

  if (soumissions.length === 0) {
    return (
      <div>
        <AllInOne />
        <div className="text-center text-gray-400 text-2xl font-bold mt-40">
          Aucune soumission disponible pour ce sondage.
        </div>
      </div>
    );
  }

  const tableRows = soumissions.map((submission, index) => (
    <tr key={index}>
      <td className="border-t border-r border-gray-300 py-2 px-4">
        {submission.created_at}
      </td>
      <td className="border-t border-r border-gray-300 py-2 px-4">
        {submission.choix}
      </td>
    </tr>
  ));

  return (
    <div className="flex align-center text-center gap-12 justify-center mb-12 flex-col font-sans">
      <AllInOne />
      <h1 className="text-gray-500 text-4xl font-black mt-10 text-center">
        {question}
      </h1>
      <table className="flex flex-col items-center bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-20 border-b text-gray-500 font-bold">
              Créé le
            </th>
            <th className="py-2 px-12 border-b text-gray-500 font-bold">
              Choix
            </th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
};

export default Soumissions;
