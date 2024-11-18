import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import TopNav from "./Components/TopNav";
import Sidebar from "./Components/SideBar";
import TerminalQuiz from "./Components/Terminal";
import UserProfile from "./Components/userProfile";
import ToolData from "./Components/ToolData";
import Labs from "./Components/LabsData";
import LoadingScreen from "./Components/LoadingPage";

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
          <Route path="/" element={<UserProfile />} />
          <Route path="/tools" element={<ToolData />} />
          <Route path="/:toolId/labs" element={<Labs />} />
          <Route path="/terminal" element={<TerminalQuiz />} />
          <Route path="/:toolId/labs/:labId/questions" element={<TerminalQuiz />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/loading" element={<LoadingScreen />} />
        </Routes>
      </main>
    </div>
  );
}