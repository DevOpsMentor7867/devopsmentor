import React, { createContext, useReducer, useEffect, useState, useContext } from "react";
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.post('/user/auth');
        if (response.status === 200) {
          dispatch({ type: 'LOGIN', payload: response.data.user });
        }
      } catch (error) {
        console.error("Authentication error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };    

    checkAuthStatus();
  }, []);
  
  console.log("AuthContext state", state);
  
  return (
    <AuthContext.Provider value={{ ...state, dispatch, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

