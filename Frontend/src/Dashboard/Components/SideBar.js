import React from "react"
import {
  LayoutDashboard,
  LayoutGrid,
  Inbox,
  Users,
  ShoppingBag,
  LogIn,
  UserPlus,
  Menu
} from "lucide-react"

export default function Sidebar({ isOpen, onToggle }) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LayoutGrid, label: "Kanban", href: "/" },
    { icon: Inbox, label: "Inbox", href: "/" },
    { icon: Users, label: "Users", href: "/" },
    { icon: ShoppingBag, label: "Products", href: "/" },
    { icon: LogIn, label: "Sign In", href: "/" },
    { icon: UserPlus, label: "Sign Up", href: "/" },
  ]

  return (
    <div className="fixed top-0 left-0 z-40 h-screen">
      <div
        className={`h-screen transition-all duration-300 ${
          isOpen ? "w-60" : "w-14"
        } bg-white bg-opacity-5 text-gray-100`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <h5 className="text-xl font-semibold uppercase text-gray-400">
                DevOps Mentor
              </h5>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-opacity-10 hover:text-white"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </button>
        </div>

        <div
          className={`m2-4 flex flex-col gap-2 py-4 overflow-y-auto h-screen ${
            isOpen ? "" : "justify-center -mt-8"
          }`}
        >
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center rounded-lg px-2 py-2 text-gray-300 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-xl"

            >
              {isOpen ? (
                <>
                  <item.icon className="h-8 w-8" />
                  <span className="ml-4">{item.label}</span>
                </>
              ) : (
                <item.icon className="h-8 w-8 " />
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}