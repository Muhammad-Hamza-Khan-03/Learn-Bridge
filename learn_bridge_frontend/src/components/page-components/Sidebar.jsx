"use client"
import { NavLink } from "react-router-dom"
import { Home, BookOpen, Search, Video, Calendar, Star, LogOut, Settings, Menu, X } from "lucide-react"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Courses", icon: BookOpen, path: "/courses" },
    { name: "Search", icon: Search, path: "/search" },
    { name: "Meetings", icon: Video, path: "/meetings" },
    // { name: "Scheduling", icon: Calendar, path: "/scheduling" },
    // { name: "Reviews", icon: Star, path: "/reviews" },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed z-50 bottom-4 right-4 md:hidden bg-indigo-600 text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold text-indigo-600">LearnBridge</h1>
          </div>

          {/* Close button (mobile only) */}
          <button
            className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${
                    isActive ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"
                  }`
                }
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <img src="/placeholder.svg?height=40&width=40" alt="User avatar" className="w-10 h-10 rounded-full" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">Alex Johnson</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <button className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <Settings className="w-5 h-5 mr-3" />
                <span className="font-medium">Settings</span>
              </button>
              <button 
                className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  // Clear token from localStorage
                  localStorage.removeItem("token");
                  // Redirect to home page
                  window.location.href = "/";
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}

export default Sidebar