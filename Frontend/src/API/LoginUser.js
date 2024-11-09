import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true 
});

export const LoginUser = () => {
  const login = async (email, password) => {
    try {
      const response = await api.post('/user/login', { email, password });
      if (response.status >= 200 && response.status < 300) {
        console.log("Login User Successful", response.data);
      } else {
        console.error("Login User Failed", response.data);
      }
    } catch (error) {
      console.error("Login User Error:", error);
    }
  };
  return { login };
};