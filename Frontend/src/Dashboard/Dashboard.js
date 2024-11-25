import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import TopNav from "./Components/TopNav";
import Sidebar from "./Components/SideBar";
import TerminalQuiz from "./Components/Terminal";
import UserProfile from "./Components/userProfile";
import ToolData from "./Components/ToolsPage";
import Labs from "./Components/LabsPage";
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
          isSidebarOpen ? "ml-60 " : "ml-14"
          // isSidebarOpen ? "ml-44 mr-8" : "ml-8 mr-8"
        } pt-16`}
      >      
        <Routes>      
          <Route path="/" element={<UserProfile />} />
          <Route path="/tools" element={<ToolData />} />
          <Route path="/:toolId/labs" element={<Labs />} /> 
          <Route path="/terminal" element={<TerminalQuiz />} />
          <Route path="/labs/:labId/questions" element={<TerminalQuiz sOpen={isSidebarOpen} />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/loading" element={<LoadingScreen />} />
        </Routes>
      </main>
    </div>
  );
}