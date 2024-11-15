import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import TopNav from "./Components/TopNav";
import Sidebar from "./Components/SideBar";
import TerminalQuiz from "./Components/Terminal";
import UserProfile from "./Components/userProfile";
import ToolData from "./Components/ToolData";

// Placeholder components for other routes


const Users = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Users</h1>
    <p className="text-gray-600">User management dashboard</p>
  </div>
);

const Products = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
    <p className="text-gray-600">Product management dashboard</p>
  </div>
);

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen">
      <TopNav isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-56" : "ml-16"
        } pt-16`}
      >      
        <Routes>      
          {/* Main routes */}
          <Route path="/" element={<UserProfile />} />
          <Route path="/kanban" element={<TerminalQuiz />} />
          <Route path="/inbox" element={<ToolData />} />
          <Route path="/users" element={<Users />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </main>
    </div>
  );
}