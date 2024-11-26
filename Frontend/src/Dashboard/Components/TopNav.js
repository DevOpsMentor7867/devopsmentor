import React, { useState } from "react";
// import { Globe, ShoppingCart, Mail, Share2, Maximize2, MoreVertical, Settings } from 'lucide-react';
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
      className={`fixed top-0 right-0 z-50 flex items-center bg-[#1A202C] px-4 py-0 transition-all duration-300 bottom-gradient-border w-full pt-4 pb-4 ${
        isSidebarOpen ? "left-60" : "left-14"
      }`}
    >
      <div className="relative flex-1 text-2xl font-semibold uppercase text-white  md:w-auto ">
        <div className="flex items-center gap-2 justify-center md:justify-start ">
          {/* <img
            src="/project-logo.png"
            alt=""
            className="object-cover h-16 w-16 md:h-20 md:w-20"
          /> */}
          {/* <span className="">Dashboard</span> */}
        </div>
      </div>
      <div className=" flex-1 text-2xl font-semibold uppercase text-white  md:w-auto mr-28 ">
        <div className=" ">
          <span className="text-btg z-10">Devops Mentor</span>
        </div>
      </div>

      <div
        className={`hidden md:flex items-center gap-2 mr-12 gap-8 ${
          isSidebarOpen ? "mr-64" : "mr-14"
        }`}
      >
        <button
          variant="ghost"
          size="icon"
          className="text-[#80EE98] hover:text-white  transition-all duration-300"
          onClick={toggleFullscreen}
        >
          <Expand className="h-5 w-5" />
        </button>

        <button
          variant="ghost"
          size="icon"
          className="text-[#80EE98] hover:text-white hover:bg-[#80EE98]/20 transition-all duration-300"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
