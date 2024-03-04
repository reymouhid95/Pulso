/* eslint-disable no-unused-vars */
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useSelector } from "react-redux";
import { refreshAccessTokenAsync, selectToken, selectUserId, setToken } from "../components/features/AuthSlice";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useDispatch } from "react-redux";
import {
  setLienSondageStockes,
  setSondageId,
} from "../components/features/SondageSlices";
import CircularProgress from "@mui/material/CircularProgress";

const Forms = () => {
  const [token] = useState(useSelector(selectToken));
  const userId = useSelector(selectUserId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [lastFieldIndex, setLastFieldIndex] = useState(0);

  const [formFields, setFormFields] = useState(
    JSON.parse(localStorage.getItem("formFields")) || [
      { type: "text", value: "", key: 0 },
    ]
  );
  const [formTitle, setFormTitle] = useState(
    localStorage.getItem("formTitle") || ""
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (token) {
      const storedFormFields = JSON.parse(localStorage.getItem("formFields"));
      const storedFormTitle = localStorage.getItem("formTitle");

      if (storedFormFields && storedFormTitle) {
        setFormFields(storedFormFields);
        setFormTitle(storedFormTitle);
      }
    }
  }, [token]);

  const handleTextareaSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current.focus();
    }
  };

  const handleFieldChange = (index, e) => {
    const newFields = [...formFields];
    newFields[index].value = e.target.value;
    setFormFields(newFields);
    localStorage.setItem("formFields", JSON.stringify(newFields));
  };

  const addField = () => {
    const newFields = [
      ...formFields,
      { type: "text", value: "", key: formFields.length },
    ];
    setFormFields(newFields);
    setLastFieldIndex(newFields.length - 1);
    localStorage.setItem("formFields", JSON.stringify(newFields));
  };

  const removeField = (index) => {
    const newFields = formFields.filter((field) => field.key !== index);
    setFormFields(newFields);
    if (newFields.length === 1) {
      setLastFieldIndex(0);
    }
    localStorage.setItem("formFields", JSON.stringify(newFields));
  };

  const submitForm = async (formData) => {
    try {
      const owner = userId;

      if (!owner) {
        console.error(
          "Utilisateur pas connecté, Impossible de créer le Sondage"
        );
        return;
      }

      formData.owner = owner;

      const res = await axios.post(
        "https://pulso-backend.onrender.com/api/sondages/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!token) {
      toast.warning("Veuillez vous identifier avant de pouvoir créer un sondage");
      setTimeout(() => {
        navigate("/connexion");
      }, 2000);
      return;
    }
  
    try {
      setLoading(true);
      const res = await submitForm({
        question: formTitle,
        options: formFields.map((field) => field.value),
      });
  
      if (res && res.status === 201) {
        const { slug, id: sondageId, owner: userId } = res.data;
        const lienSondage = `https://pulso-psi.vercel.app/sondages/${slug}`;
  
        dispatch(setLienSondageStockes({ sondageId, lien: lienSondage, owner: userId }));
        dispatch(setSondageId([sondageId]));
  
        navigate(`/last-survey/${sondageId}`);
  
        toast.success("Sondage créé. Vous pouvez à présent partager votre sondage !");
        setFormTitle("");
        setFormFields([{ type: "text", value: "", key: 0 }]);
        localStorage.removeItem("formFields");
        localStorage.removeItem("formTitle");
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
  
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
  
          const res = await submitForm({
            question: formTitle,
            options: formFields.map((field) => field.value),
          });
  
          if (res && res.status === 201) {
            const { slug, id: sondageId, owner: userId } = res.data;
            const lienSondage = `https://pulso-psi.vercel.app/sondages/${slug}`;
  
            dispatch(setLienSondageStockes({ sondageId, lien: lienSondage, owner: userId }));
            dispatch(setSondageId([sondageId]));
  
            navigate(`/last-survey/${sondageId}`);
  
            toast.success("Sondage créé. Vous pouvez à présent partager votre sondage !");
            setFormTitle("");
            setFormFields([{ type: "text", value: "", key: 0 }]);
            localStorage.removeItem("formFields");
            localStorage.removeItem("formTitle");
          }
        } catch (refreshError) {
          console.error("Erreur lors du rafraîchissement du token:", refreshError);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="flex items-center justify-center mt-40 font-sans">
      <Toaster position="top-left" />
      <div className="absolute right-5 top-28">
      </div>
      <form onSubmit={handleSubmit} className="mt-20">
        <div className="mb-4">
          <textarea
            placeholder="Titre du formulaire"
            className="w-full p-2 border-none outline-none text-4xl font-bold rounded-md text-gray-500"
            required
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              localStorage.setItem("formTitle", e.target.value);
            }}
          ></textarea>
        </div>
        {formFields.map((field, index) => (
          <div key={field.key} className="flex items-center mb-4">
            <div className="ml-2 flex">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => removeField(field.key)}
                  className="px-2 py-1 mr-1 rounded text-gray-500"
                >
                  <DeleteIcon />
                </button>
              )}
              {(index === lastFieldIndex ||
                index === formFields.length - 1) && (
                <button
                  type="button"
                  onClick={addField}
                  className="px-2 py-1 rounded text-gray-500"
                >
                  <AddRoundedIcon />
                </button>
              )}
            </div>
            <input
              ref={index === lastFieldIndex ? inputRef : null}
              type={field.type}
              placeholder="Contenu du formulaire"
              value={field.value}
              onChange={(e) => handleFieldChange(index, e)}
              className="w-full px-2 border-b border-gray-300 font-bold focus:outline-none focus:border-gray-400 rounded text-gray-500"
              required
            />
          </div>
        ))}
  
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-4 py-2 bg-black  hover:bg-gray-800 font-bold text-white rounded"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={19} thickness={4} />
            ) : (
              "Soumettre"
            )}{" "}
            <ArrowForwardIcon className="ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Forms;
