import React, { useState } from "react";
import { Expand, Settings } from "lucide-react";
import "./SideBar.css";

export default function TopNav({ isSidebarOpen }) {
  // eslint-disable-next-line
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 right-0 z-50 flex items-center justify-between bg-[#1A202C] px-4 py-4 transition-all duration-300 bottom-gradient-border w-full ${
        isSidebarOpen ? "left-60" : "md:left-14"
      }`}
    >
      <div className="flex-1 text-center">
        <span className="text-btg z-10 text-2xl md:text-2xl ml-8 md:ml-16 font-semibold uppercase ">
          DEV∞OPS Mentor
        </span>
      </div>

      <div
        className={`flex items-center gap-4 md:gap-8 ${
          isSidebarOpen ? "md:mr-64" : "md:mr-14"
        }`}
      >
        <button
          variant="ghost"
          size="icon"
          className="hidden md:block text-[#80EE98] hover:text-white transition-all duration-300"
          onClick={toggleFullscreen}
        >
          <Expand className="h-5 w-5" />
        </button>

        <button
          variant="ghost"
          size="icon"
          className="hidden md:block text-[#80EE98] hover:text-white hover:bg-[#80EE98]/20 transition-all duration-300"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
