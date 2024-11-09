import { createContext, useReducer, useEffect } from "react";
import axios from 'axios';

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user/checkAuth', {
          withCredentials: true
        });
        if (response.data.user) {
          dispatch({ type: 'LOGIN', payload: response.data.user });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    };

    checkAuthStatus();
  }, []);
  
  console.log("AuthContext state", state);
  
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
        {children} 
    </AuthContext.Provider>
  )
};