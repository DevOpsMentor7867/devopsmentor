import React, { useState } from "react"
import {
  Globe,
  ShoppingCart,
  Mail,
  Share2,
  Maximize2,
  MoreVertical,
  Settings,
//   Search
} from "lucide-react"

export default function TopNav({ isSidebarOpen }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <nav 
      className={`fixed top-0 right-0 z-50 flex items-center gap-4 bg-white bg-opacity-5 px-8 py-4 transition-all duration-300 ${
        isSidebarOpen ? "left-60" : "left-14"
      }`}
    >
      <div className="relative flex-1">
       
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-lg p-2 text-gray-400 hover:bg-white hover:bg-opacity-10"
          aria-label="Language"
        >
          <Globe className="h-5 w-5" />
        </button>

        <button
          className="relative rounded-lg p-2 text-gray-400 hover:bg-white hover:bg-opacity-10"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-bold">
            2
          </span>
        </button>

        <button
          className="relative rounded-lg p-2 text-gray-400 hover:bg-white hover:bg-opacity-10"
          aria-label="Messages"
        >
          <Mail className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-bold">
            5
          </span>
        </button>

        <button
          className="rounded-lg p-2 text-gray-400 hover:bg-white hover:bg-opacity-10"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5" />
        </button>

        <button
          className="rounded-lg p-2 text-gray-400 hover:bg-white hover:bg-opacity-10"
          aria-label="Toggle fullscreen"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-5 w-5" />
        </button>

        <button
          className="rounded-lg p-2 text-gray-400 hover:bg-white hover:bg-opacity-10"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        <div className="h-8 w-8 overflow-hidden rounded-full">
          <img
            src="project-logo.png"
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </div>

        <button
          className="rounded-lg p-2 text-gray-400 hover:bg-white hover:bg-opacity-10"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </nav>
  )
}