import React from 'react'
import { LogoutUser } from '../../API/LogoutUser';  // Assuming you will create the LogoutUser function
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout } = LogoutUser();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login')
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden relative p-4 sm:p-6 md:p-8 text-white text-center text-6xl">
    <h1>THIS IS THE DASHBOARD PAGE</h1>
    <button
      onClick={handleLogout}
      className="mt-8 py-2 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition ease-in-out duration-300 w-50"
    >
      Logout
    </button>
  </div>
  
  );
}
