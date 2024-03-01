import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import { CircularProgress } from "@mui/material";
import { Toaster, toast } from "sonner";

const SondageVote = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [sondageDetails, setSondageDetails] = useState({
    id: null,
    question: "",
    options: [],
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSondageDetails = async () => {
      try {
        const response = await axios.get(
          `https://pulso-backend.onrender.com/api/sondages/${slug}`
        );

        setSondageDetails({
          id: response.data.id || null,
          question: response.data.question,
          options: response.data.options || [],
        });
      } catch (error) {
        console.error("Erreur:", error);
        setSondageDetails(null);
      }
    };

    fetchSondageDetails();
  }, [slug]);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };

  const handleVoteClick = async () => {
    try {
      if (!selectedOption) {
        console.error("Veuillez sélectionner une option avant de voter.");
        return;
      }

      setIsLoading(true);

      const response = await axios.post(
        "https://pulso-backend.onrender.com/api/sondages/choix/",
        {
          choix: selectedOption,
          sondage_id: sondageDetails.id,
        }
      );

      // Vérifier la réponse du serveur
      if (response.status === 201) {
        toast.success("Merci pour votre vote!");
        setTimeout(() => {
          navigate("/pageaftervote");
        }, 2000);
      } else {
        console.error("Erreur lors du vote");
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!sondageDetails) {
    return <div>Loading...</div>;
  }

  const { question, options } = sondageDetails;

  return (
    <div className="text-center mt-40 font-sans">
      <Toaster position="top-left" />
      <h1 className="text-gray-500 text-4xl font-black mb-10 text-center">
        {question}
      </h1>
      <ul className="list-none">
        {options.map((option, index) => (
          <li key={index} className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-indigo-600"
                value={option}
                checked={selectedOption === option}
                onChange={() => handleRadioChange(option)}
              />
              <span className="ml-2">{option}</span>
            </label>
          </li>
        ))}
      </ul>
      <button
        className={`bg-${isLoading ? "gray-400" : "blue-500"} hover:bg-${
          isLoading ? "gray-400" : "blue-700"
        } text-white font-bold py-1 px-4 rounded-md mt-4`}
        onClick={handleVoteClick}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={20} /> : "Voter"}
      </button>
      {isLoading && <LinearProgress />}
    </div>
  );
};

export default SondageVote;
