import { useState } from "react";
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true 
});

export const VerifyOTP = () => {
  const [VerifyotpError, setError] = useState(null);

  const PostSignup = async (email, otp) => {
    setError(null);  // Clear previous errors
    console.log("FE otp", email, otp);

    try {
      const response = await api.post('/user/verify', { email, otp });

      if (response.status >= 200 && response.status < 300) {
        console.log("Signup successful", response.data);
      } else {
        setError(response.data.message); // Set error message from backend
        console.error("Signup failed", response.data);
      }
    } catch (error) {
      if (error.response) {
        // Error from backend
        setError(error.response.data.message);  // Set specific backend error
        console.error("Error:", error.response.data.message);
      } else {
        // Network error or other
        setError("An unexpected error occurred");
        console.error("Error:", error);
      }
    }
  };

  return { PostSignup, VerifyotpError };  // Return otpError so you can use it in components
};
