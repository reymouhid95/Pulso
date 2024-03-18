/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  refreshAccessTokenAsync,
  selectToken,
  selectUserId,
  setToken,
} from "../components/features/AuthSlice";
import { useNavigate } from "react-router-dom";
import { selectLienSondageStockes } from "../components/features/SondageSlices";
import LinearProgress from "@mui/material/LinearProgress";
import { getSondages } from "../components/services/SondageServices";
import { toast } from "sonner";

const ListSondages = () => {
  const [sondages, setSondages] = useState([]);
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const userId = useSelector(selectUserId);
  const lienSondagesStockes = useSelector(selectLienSondageStockes);
  const dispatch = useDispatch();

  const tokenAccess = localStorage.getItem("accessToken");
  useEffect(() => {
    const fetchData = async () => {
      if (tokenAccess && isMounted.current) {
        try {
          const userSondages = await getSondages(tokenAccess, userId);

          const filteredSondageIds = lienSondagesStockes
            .filter((s) =>
              userSondages.map((sondage) => sondage.id).includes(s.sondageId)
            )
            .map((s) => s.sondageId);

          console.log(" Sondage Ids:", filteredSondageIds);

          const updatedSondages = [...userSondages, ...sondages];

          setSondages(updatedSondages.reverse());

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
                const userSondages = await getSondages(newAccessToken, userId);

                const updatedSondages = [...userSondages, ...sondages];

                setSondages(updatedSondages.reverse());
              } else {
                console.error("Token pas disponible");
              }
            } catch (refreshError) {
              console.error(
                "Erreur lors du rafraîchissement du token:",
                refreshError
              );
              toast.error("Votre session a expiré. Veuillez vous reconnecter!");
              dispatch(logout());
              setTimeout(() => {
                navigate("/connexion");
              }, 2000);
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

    if (tokenAccess) {
      fetchData();
    } else {
      console.error("Token pas disponible");
    }

    return () => {
      isMounted.current = false;
    };
  }, [tokenAccess, userId, dispatch]);

  const handleClick = (sondageId) => {
    navigate(`/resultats/${sondageId}`);
  };

  return (
    <>
      {loading && <LinearProgress className="mt-20" />}
      <div className="mt-10 md:mt-30 text-start ms-20 font-bold font-sans">
        <hr className="pb-4" />
        {sondages.length === 0 ? (
          <div className="text-gray-700">
            Aucun sondage trouvé. Veuillez en créer un.
          </div>
        ) : (
          sondages.map((survey) => (
            <div
              key={survey.id}
              className="mb-5 hover:bg-gray-200 hover:border-gray-100 hover:shadow-md p-4 rounded-md md:ms-12 cursor-pointer"
              onClick={() => handleClick(survey.id)}
            >
              <ul className="list-none text-gray-700 text-base">
                <li>{survey.question}</li>
              </ul>
              <p className="text-gray-500 mt-2">
                Voir le résultat, la soumission et le lien de votre sondage
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ListSondages;
