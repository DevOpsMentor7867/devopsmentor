import React from "react";
import { Menu } from "lucide-react";
import "./SideBar.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTools,
  faFlask,
  faTerminal,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({ isOpen, onToggle }) {
  const menuItems = [
    {
      icon: <FontAwesomeIcon icon={faHome} />,
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      icon: <FontAwesomeIcon icon={faTools} />,
      label: "Tools",
      to: "/dashboard/tools",
    },
    {
      icon: <FontAwesomeIcon icon={faFlask} />,
      label: "Labs",
      to: "/dashboard/labs",
    },
    {
      icon: <FontAwesomeIcon icon={faTerminal} />,
      label: "Terminal",
      to: "/dashboard/terminal",
    },
    {
      icon: <FontAwesomeIcon icon={faUserCircle} />,
      label: "Profile",
      to: "/dashboard/profile",
    },
  ];

  return (
    <div className="fixed top-0 left-0 z-40 h-screen">
      <div
        className={`h-screen transition-all duration-300 relative border-r border-transparent sidebar-gradient-border ${
          isOpen ? "w-[13rem]" : "w-14"
        } bg-white bg-opacity-5 text-gray-100`}
      >
        <div className="flex h-16 items-center justify-between pr-[12px]">
          {isOpen && (
            <div className="flex items-center mt-4 pl-4">
              <h5 className="text-2xl font-semibold uppercase text-gray-400">
                Menu
              </h5>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-opacity-10 hover:text-white mt-4"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </button>
        </div>

        <div
          className={`m2-4 flex flex-col gap-2 py-4 overflow-y-auto h-screen ${
            isOpen ? "justify-center -mt-8" : "justify-center -mt-8"
          }`}
        >
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center rounded-lg px-2 py-2 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-xl text-gray-300 ml-[6px]"
            >
              {isOpen ? (
                <>
                  <div className="h-8 w-8 ">{item.icon}</div>
                  <span className="ml-4 text-transparent bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text">
                    {item.label}
                  </span>
                </>
              ) : (
                item.icon
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}