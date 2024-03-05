import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { refreshAccessTokenAsync, selectToken, selectUserId, setToken } from "../components/features/AuthSlice";
import { useNavigate } from "react-router";
import { selectLienSondageStockes } from "../components/features/SondageSlices";
import LinearProgress from "@mui/material/LinearProgress";
import { useParams } from "react-router-dom";

const Sondages = () => {
  const [sondages, setSondages] = useState([]);
  const token = useSelector(selectToken);
  const userId = useSelector(selectUserId);
  const navigate = useNavigate();
  const lienSondagesStockes = useSelector(selectLienSondageStockes);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const isMounted = useRef(true);

  const { sondageId } = useParams();
  console.log(sondageId);

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

          const filteredSondageIds = lienSondagesStockes
            .filter((s) =>
              userSondages.map((sondage) => sondage.id).includes(s.sondageId)
            )
            .map((s) => s.sondageId);

          console.log("Sondage Ids:", filteredSondageIds);
          const sortedSondages = userSondages.sort((a, b) => b.id - a.id);

          setSondages([sortedSondages[0]]);

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
                // fetchData();
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

                const filteredSondageIds = lienSondagesStockes
                  .filter((s) =>
                    userSondages
                      .map((sondage) => sondage.id)
                      .includes(s.sondageId)
                  )
                  .map((s) => s.sondageId);

                console.log(" Sondage Ids:", filteredSondageIds);

                setSondages(userSondages);
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
      console.error("Token not available");
    }

    return () => {
      isMounted.current = false;
    };
  }, [token, userId, lienSondagesStockes, dispatch]);

  const handleClick = (sondageId) => {
    navigate(`/resultats/${sondageId}`);
  };

  return (
    <div className="mt-30 text-center font-sans ">
      {loading && <LinearProgress className="mt-20" />}
      {!loading && token && sondages.length === 0 && (
        <div className="text-center text-gray-400 text-2xl font-bold mt-40">
          {token &&
            "Aucun sondage à afficher. Veuillez créer d'abord vos sondages pour qu'ils puissent s'afficher ici !"}
        </div>
      )}
      <div className="flex flex-wrap align-center justify-center gap-4 cursor-pointer mt-40">
        {sondages.map((sondage) => (
          <div
            key={sondage.id}
            className="rounded-lg overflow-hidden shadow-lg bg-white m-2 w-full text-center"
            onClick={() => handleClick(sondage.id)}
          >
            <div className="px-6 py-4">
              <div className="font-bold text-xl text-center mb-2 py-3 bg-slate-500 text-white ">
                {sondage.question}
              </div>
              <ol className="text-gray-400 font-bold hover:text-gray-600 text-items-center justify-center px-5">
                {sondage.options.map((option, index) => (
                  <li key={index}>{`${index + 1}. ${option}`}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sondages;
