import axios from 'axios';
import { useAuthContext } from "../API/UseAuthContext";

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true 
});

export const LoginUser = () => {
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    try {
      const response = await api.post('/user/login', { email, password });
      
      // Check if the response is successful
      if (response.status >= 200 && response.status < 300) {
        // Accessing the token and message from response.data
        const { token, email } = response.data;
        
        // Dispatching the action with the correct payload
        dispatch({ 
          type: "LOGIN", 
          payload: { token, email } 
        });
      } else {
        console.error("Login User Failed", response.data);
      }
    } catch (error) {
      console.error("Login User Error:", error);
    }
  };

  return { login };
};
