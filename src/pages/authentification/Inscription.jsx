/* eslint-disable react/no-unescaped-entities */
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  checkEmailExists,
  registerUser,
} from "../../components/services/AuthServices";
import { setUser, setToken } from "../../components/features/AuthSlice";
import { Toaster, toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const Inscription = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const emailExistsResponse = await checkEmailExists(data.email);
      if (emailExistsResponse && emailExistsResponse.exists) {
        toast.warning(
          "Cet email existe déjà. Veuillez utiliser un autre email."
        );
        setLoading(false);
        return;
      }

      if (data.password !== data.password2) {
        toast.error("Les mots de passe ne correspondent pas.");
        setLoading(false);
        return;
      }

      const response = await registerUser(
        data.email,
        data.password,
        data.password2,
        data.name,
        data.tc
      );

      dispatch(setUser(response.user));
      dispatch(setToken(response.token));

      reset();
      setLoading(false);
      toast.success("Vous êtes à présent inscrit, amusez-vous!");
      setTimeout(() => {
        navigate("/connexion");
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error("Erreur lors de l'inscription :", error);
      toast.error(
        "Votre inscription a échoué. Veuillez vérifier votre connexion internet!"
      );
    }
  };

  return (
    <div className="mt-40 font-sans">
      <Toaster position="top-left" />
      <div className="max-w-md mx-auto mt-6 p-6 bg-white shadow-lg rounded-md backdrop-filter backdrop-blur-sm">
        <h2 className="text-gray-500 text-3xl mb-6 font-bold text-center">
          Pulso
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Entrer le nom"
              {...register("name", { required: true })}
              className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Entrer l'email"
              {...register("email", { required: true })}
              className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Entrer le mot de passe"
              {...register("password", { required: true })}
              className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              id="password2"
              name="password2"
              placeholder="Confirmer le mot de passe"
              {...register("password2", { required: true })}
              className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="tc"
              name="tc"
              {...register("tc", { required: true })}
              className="mr-2"
              required
            />
            <label htmlFor="tc" className="text-gray-600 text-sm font-bold">
              J'accepte les termes et conditions
            </label>
          </div>
          <button
            type="submit"
            className={`w-full font-bold ${
              loading ? "bg-gray-400" : "bg-blue-500"
            } text-white py-1 mt-4 px-4 rounded-md hover:${
              loading ? "bg-gray-400" : "bg-blue-600"
            } focus:outline-none focus:${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress
                size={19}
                thickness={4}
                className="text-white"
              />
            ) : (
              "S'inscrire"
            )}
          </button>
          <p className="text-sm text-center text-gray-800 mt-4">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/connexion"
              href="#"
              className="font-medium text-blue-500 hover:underline dark:text-primary-500"
            >
              Connectez-vous ici !
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Inscription;
