import React, { createContext, useReducer, useEffect, useContext } from "react";
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
      // Handle both user and token in a backward-compatible way
      return { 
        ...state, 
        user: action.payload.user || action.payload, // Support both new and old payload format
        token: action.payload.token || null, // Add token support
        loading: false 
      };
    case "LOGOUT":
      return { 
        ...state, 
        user: null,
        token: null, // Clear token on logout
        loading: false 
      };
    case "UPDATE_USER":
      return { 
        ...state, 
        user: { ...state.user, ...action.payload } 
      };
    case "SET_LOADING":
      return { 
        ...state, 
        loading: action.payload 
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null, // Add token to initial state
    loading: true,
  });

  const updateUser = (newUserData) => {
    dispatch({ type: 'UPDATE_USER', payload: newUserData });
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.post('/user/auth');
        if (response.status === 200) {
          // Handle both user and token in the response
          dispatch({ 
            type: 'LOGIN', 
            payload: {
              user: response.data.user,
              token: response.data.token
            }
          });
        }
      } catch (error) {
        console.error("Authentication error:", error.response?.data || error.message);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };    

    checkAuthStatus();
  }, []);
  
  console.log("AuthContext state:", state);
  
  return (
    <AuthContext.Provider value={{ ...state, dispatch, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthContextProvider');
  }
  return context;
};

