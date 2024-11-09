import axios from 'axios';
import { useAuthContext } from "../API/UseAuthContext";

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, 
});

export const LogoutUser = () => {
    const {dispatch} = useAuthContext();

  const logout = async () => {
    try {
      const response = await api.post('/user/logout'); 
      if (response.status >= 200 && response.status < 300) {
        dispatch({type: 'LOGOUT'})
        
      } else {
        console.error("Logout Failed", response.data);
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return { logout };
};
