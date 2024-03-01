import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { refreshAccessTokenAsync, selectToken, selectUserId, setToken } from "../components/features/AuthSlice";
import { useNavigate } from "react-router";
import { selectLienSondageStockes } from "../components/features/SondageSlices";
import LinearProgress from "@mui/material/LinearProgress";


const Sondages = () => {
  const [sondages, setSondages] = useState([]);
  const token = useSelector(selectToken);
  const userId = useSelector(selectUserId);
  const navigate = useNavigate();
  const lienSondagesStockes = useSelector(selectLienSondageStockes);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const isMounted = useRef(true);
  // const tokenTest = localStorage.getItem('accessToken')

  useEffect(() => {
    const fetchData = async () => {
      if (token && isMounted.current) {

        try {
          const response = await axios.get("https://pulso-backend.onrender.com/api/sondages/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userSondages = response.data.filter((survey) => {
            return survey.owner === parseInt(userId);
          });

          const filteredSondageIds = lienSondagesStockes
            .filter((s) =>
              userSondages.map((sondage) => sondage.id).includes(s.sondageId)
            )
            .map((s) => s.sondageId);

          console.log(" Sondage Ids:", filteredSondageIds);

          setSondages(userSondages);
          setLoading(false);
        } catch (error) {
          if (error.response.status === 401) {
            try {
              const refreshResponse = await dispatch(refreshAccessTokenAsync());
              const newAccessToken = refreshResponse.payload.access;
              localStorage.setItem("accessToken", newAccessToken);
              console.log('Nouveau Token:', newAccessToken);

              dispatch(setToken({
                access: newAccessToken,
                user_id: localStorage.getItem('user_id'),
                expiry: refreshResponse.payload.expiry
              }));              

              if (newAccessToken) {
                // fetchData();
                const res = await axios.get("https://pulso-backend.onrender.com/api/sondages/", {
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
              console.log('Reponses:', res)

              const userSondages = res.data.filter((survey) => {
                return survey.owner === parseInt(userId);
              });
    
              const filteredSondageIds = lienSondagesStockes
                .filter((s) =>
                  userSondages.map((sondage) => sondage.id).includes(s.sondageId)
                )
                .map((s) => s.sondageId);
    
              console.log(" Sondage Ids:", filteredSondageIds);
    
              setSondages(userSondages);
                console.log('Token refreshing succesufully')
              } else {
                console.error("Token pas disponible");
              }
            
            } catch (refreshError) {
              console.error("Erreur lors du rafraîchissement du token:", refreshError);
            }finally{
              setLoading(false);
            }
          } else {
            console.error("Erreur lors de la récupération des sondages:", error);
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
  }, [token, userId, lienSondagesStockes, dispatch]);

  const handleClick = (sondageId) => {
    navigate(`/resultats/${sondageId}`);
  };

  return (
    <div className="mt-30 text-center font-sans">
      {loading && <LinearProgress className="mt-20" />}
      {!loading && token && sondages.length === 0 && (
        <div className="text-center text-gray-400 text-2xl font-bold">
          {token &&
            "Aucun sondage à afficher pour l'utilisateur connecté. Veuillez créer d'abord vos sondages pour qu'ils puissent s'afficher ici !"}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-4 cursor-pointer">
        {sondages.length === 1 ? (
          <div
            key={sondages[0].id}
            className="w-full rounded-lg overflow-hidden shadow-lg bg-gray-200 bg-opacity-75 m-2"
          >
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2 py-3 bg-slate-500 text-white">
                {sondages[0].question}
              </div>
              <ul className="list-disc text-gray-700 text-base">
                {sondages[0].options.map((option, index) => (
                  <li key={index}>{`${index + 1}. ${option}`}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          sondages.map((survey) => (
            <div
              key={survey.id}
              className="rounded-lg overflow-hidden shadow-lg bg-white m-2 w-72 text-center"
              onClick={() => handleClick(survey.id)}
            >
              <div className="py-4">
                <div className="font-bold text-xl mb-2 py-3 bg-slate-500 text-white ">
                  {survey.question}
                </div>
                <ol className=" text-gray-400 font-bold hover:text-gray-600 text-start px-5">
                  {survey.options.map((option, index) => (
                    <li key={index}>{`${index + 1}. ${option}`}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sondages;
