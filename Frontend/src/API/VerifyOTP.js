import { useState } from "react";
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true 
});

export const VerifyOTP = () => {
  const [VerifyotpError, setError] = useState(null);
  const [otpSuccess, setotpSuccess] = useState(null);

  const PostSignup = async (email, otp) => {
    setError(null);  
    setotpSuccess(null);  
    console.log("FE otp", email, otp);

    try {
      const response = await api.post('/user/verify', { email, otp });

      if (response.status >= 200 && response.status < 300) {
        console.log("Signup successful", response.data.message);
        setotpSuccess(response.data.message);
      } else {
        setError(response.data.message); 
        console.error("Signup failed", response.data);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message); 
        console.error("Error:", error.response.data.message);
      } else {
        setError("An unexpected error occurred");
        console.error("Error:", error);
      }
    }
  };

  return { PostSignup, VerifyotpError, otpSuccess };  
};
