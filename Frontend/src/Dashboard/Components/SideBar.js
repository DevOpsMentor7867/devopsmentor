import React from "react";
import {
  LayoutDashboard,
  LayoutGrid,
  Inbox,
  Users,
  ShoppingBag,
  LogIn,
  UserPlus,
  Menu,
} from "lucide-react";
import "./SideBar.css";
import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, onToggle }) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/Dashboard" },
    { icon: LayoutGrid, label: "Kanban", to: "/dashboard/kanban" },
    { icon: Inbox, label: "Inbox", to: "/dashboard/inbox" },
    { icon: Users, label: "Users", to: "/dashboard/users" },
    { icon: ShoppingBag, label: "Products", to: "/dashboard/products" },
    { icon: LogIn, label: "Sign In", to: "/dashboard/signin" },
    { icon: UserPlus, label: "Sign Up", to: "/dashboard/signup" },
  ];

  return (
    <div className="fixed top-0 left-0 z-40 h-screen  ">
      <div
        className={`h-screen transition-all duration-300 relative h-screen border-r border-transparent sidebar-gradient-border ${
          isOpen ? "w-[13rem]" : "w-14"
        } bg-white bg-opacity-5 text-gray-100`}
      >
        <div className="flex h-16 items-center justify-between pr-4">
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
              to={item.to} // Replace 'href' with 'to' for React Router Link
              className="flex items-center rounded-lg px-2 py-2 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-xl text-gray-300"
            >
              {isOpen ? (
                <>
                  <div className="h-8 w-8 text-gradient-to-r from-cyan-500 to-blue-500">
                    <item.icon className="h-8 w-8" />
                  </div>

                  <span className="ml-4 text-transparent bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text">
                    {item.label}
                  </span>
                </>
              ) : (
                <item.icon className="h-8 w-8" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
