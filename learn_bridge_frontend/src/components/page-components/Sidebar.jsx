import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
  BookOpen,
  Search,
  Video,
  Star,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const Sidebar = ({ isOpen, setIsOpen, role = "student" }) => {
  const location = useLocation()

  const studentNavItems = [
    { name: "Dashboard", icon: Home, path: "/student/dashboard" },
    { name: "Courses", icon: BookOpen, path: "/student/catalog" },
    { name: "Search", icon: Search, path: "/student/search" },
    { name: "Meetings", icon: Video, path: "/student/meetings" },
    { name: "Reviews", icon: Star, path: "/student/reviews" },
    { name: "Profile", icon: Settings, path: "/profile" },
  ]

  const tutorNavItems = [
    { name: "Dashboard", icon: Home, path: "/tutor/dashboard" },
    { name: "My Courses", icon: BookOpen, path: "/tutor/catalog" },
    { name: "Upcoming Sessions", icon: Calendar, path: "/tutor/meetings" },
    { name: "Find Students", icon: Search, path: "/tutor/search" },
    { name: "Profile", icon: Settings, path: "/profile" },
   ]

  const navItems = role === "student" ? studentNavItems : tutorNavItems

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed z-50 bottom-4 right-4 md:hidden bg-[#3B82F6] text-white p-3 rounded-full shadow-lg"
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
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-[#3B82F6] font-poppins">
              {role === "student" ? "LearnBridge" : "TutorPro"}
            </h1>
          </div>

          {/* Close (mobile) */}
          <button
            className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200 ${
                    isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                <span className="font-medium">{role === "student" ? "AJ" : "TJ"}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {role === "student" ? "Alex Johnson" : "Thomas Johnson"}
                </p>
                <p className="text-xs text-gray-500">{role === "student" ? "Student" : "Mathematics Tutor"}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <Settings className="w-5 h-5 mr-3" />
                <span className="font-medium">Settings</span>
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  localStorage.removeItem("token")
                  window.location.href = "/"
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

export default Sidebar
