import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true 
});

export const RegisterUser = () => {


  const signup = async (email, password) => {

    try {
      const response = await api.post('/user/register', { email, password });

      if (response.status >= 200 && response.status < 300) {
        console.log("Register User Successful", response.data);
      } else {
        console.error("Register User Failed", response.data);
      }
    } catch (error) {
      console.error("Register User Error:", error);
    }
  };

  return { signup };
};