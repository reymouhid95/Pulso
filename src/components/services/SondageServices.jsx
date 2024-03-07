import axios from "axios";

const API_BASE_URL = "https://pulso-backend.onrender.com/api/sondages/";

export const postSondage = async (formData, token, userId) => {
  try {
    const owner = userId;

    if (!owner) {
      console.error(
        "Utilisateur non connecté. Impossible de créer le sondage."
      );
      return;
    }

    formData.owner = owner;

    const res = await axios.post(`${API_BASE_URL}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error) {
    console.error("Erreur lors de la création du sondage :", error);
    throw error;
  }
};

export const getSondages = async (token, userId) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userSondages = response.data.filter((survey) => {
      return survey.owner === parseInt(userId);
    });

    return userSondages;
  } catch (error) {
    console.error("Erreur lors de la récupération des sondages :", error);
    throw error;
  }
};
