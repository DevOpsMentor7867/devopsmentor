import axios from 'axios';
import { useAuthContext } from "../API/UseAuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true 
});

export const LoginUser = () => {
  const { dispatch } = useAuthContext();
  const [loginError, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    setError(null);

    try {
      const response = await api.post('/user/login', { email, password });
      if (response.status >= 200 && response.status < 300) {
        const { token, email } = response.data;
        dispatch({ 
          type: "LOGIN", 
          payload: { token, email } 
        });
        navigate("/Dashboard");
      } else {
        setError(response.data.message || "An error occurred during login.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login User Error:", error);
    }
  };

  return { login, loginError };
};
