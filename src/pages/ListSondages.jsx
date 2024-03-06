import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  refreshAccessTokenAsync,
  selectToken,
  selectUserId,
  setToken,
} from "../components/features/AuthSlice";
import { useNavigate } from "react-router-dom";
import { selectLienSondageStockes } from "../components/features/SondageSlices";
import LinearProgress from "@mui/material/LinearProgress";

const ListSondages = () => {
  const [sondages, setSondages] = useState([]);
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const userId = useSelector(selectUserId);
  const lienSondagesStockes = useSelector(selectLienSondageStockes);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (token && isMounted.current) {
        try {
          const response = await axios.get(
            "https://pulso-backend.onrender.com/api/sondages/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const userSondages = response.data.filter((survey) => {
            return survey.owner === parseInt(userId);
          });

          // Mettre à jour les sondages en ajoutant les nouveaux au début
          setSondages((prevSondages) => [...userSondages, ...prevSondages]);

          // Inverser l'ordre des sondages pour placer les nouveaux en premier
          setSondages((prevSondages) => [...prevSondages].reverse());

          setLoading(false);
        } catch (error) {
          if (error.response.status === 401) {
            try {
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
                const res = await axios.get(
                  "https://pulso-backend.onrender.com/api/sondages/",
                  {
                    headers: {
                      Authorization: `Bearer ${newAccessToken}`,
                    },
                  }
                );

                const userSondages = res.data.filter((survey) => {
                  return survey.owner === parseInt(userId);
                });

                // Mettre à jour les sondages en ajoutant les nouveaux au début
                setSondages((prevSondages) => [
                  ...userSondages,
                  ...prevSondages,
                ]);

                // Inverser l'ordre des sondages pour placer les nouveaux en premier
                setSondages((prevSondages) => [...prevSondages].reverse());
              } else {
                console.error("Token pas disponible");
              }
            } catch (refreshError) {
              console.error(
                "Erreur lors du rafraîchissement du token:",
                refreshError
              );
            } finally {
              setLoading(false);
            }
          } else {
            console.error(
              "Erreur lors de la récupération des sondages:",
              error
            );
          }
        }
      }
    };

    if (token) {
      fetchData();
    } else {
      console.error("Token pas disponible");
    }

    return () => {
      isMounted.current = false;
    };
  }, [token, userId, dispatch]);

  const handleClick = (sondageId) => {
    navigate(`/resultats/${sondageId}`);
  };

  return (
    <>
      {loading && <LinearProgress className="mt-20" />}
      <div className="mt-10 md:mt-30 text-start ms-20 font-bold font-sans">
        <hr className="pb-4" />
        {sondages.map((survey) => (
          <div
            key={survey.id}
            className="mb-5 hover:bg-gray-200 hover:border-gray-100 hover:shadow-md p-4 rounded-md md:ms-12 cursor-pointer"
            onClick={() => handleClick(survey.id)}
          >
            <ul className="list-none text-gray-700 text-base">
              <li>{survey.question}</li>
            </ul>
            <p className="text-gray-500 mt-2">Pulso-Submissions</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ListSondages;
