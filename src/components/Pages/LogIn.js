import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Core/NavBar";
import FloatingIcons from "../Core/FloatingIcons";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Implement login logic here
    console.log("Login attempted with:", email, password);
  };

  return (
    <div>
      <NavBar />
      <FloatingIcons />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white ">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 relative z-10 -mt-24  ">
          <h2 className="text-4xl font-bold mb-6 text-center text-customGreen">
            DevOps Mentor
          </h2>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login to Your Account
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-customGreen text-white py-2 rounded-md hover:bg-greenhover transition-colors"
            >
              Login
            </button>
          </form>
          <div className="mt-4 flex flex-col items-center text-sm space-y-2">
          <p className="mt-4 text-center text-sm">
            Don't Have An Account?{" "}
            <Link to="/signup" className="text-customGreen hover:underline">
              Sign Up
            </Link>
          </p>

            <Link
              to="/forgot-password"
              className="text-customGreen hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
