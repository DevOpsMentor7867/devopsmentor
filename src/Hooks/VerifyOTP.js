import { useState } from "react";
import { useAuthContext } from "./UseAuthContext";
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true 
});

export const VerifyOTP = () => {
  const [signupError, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const PostSignup = async (email, otpValue) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/user/VerifyOTP', {email, otpValue });

      if (response.status >= 200 && response.status < 300) {
        console.log("Signup successful", response.data);
        dispatch({ type: "LOGIN", payload: response.data });
      } else {
        console.error("Signup failed", response.data);
        setError(response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return { PostSignup, signupError, isLoading };
};