import { useState } from "react";
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true 
});

export const RegisterUser = () => {
  const [RegisterError, setError] = useState(null);
  const [RegisterCheck, setRegCheck] = useState(null);

  const signup = async (email, password) => {
    setError(null);
    setRegCheck(null);

    try {
      const response = await api.post('/user/register', { email, password });

      if (response.status >= 200 && response.status < 300) {
        console.log("Register User Successful", response.data);
        setRegCheck(response.data);
      } else {
        setError("Failed to register user.");
        console.error("Register User Failed", response.data);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred during registration.");
      }
      console.error("Register User Error:", error);
    }
    console.log(RegisterError, "refefefe")
  };

  return { signup, RegisterError, RegisterCheck };
};
