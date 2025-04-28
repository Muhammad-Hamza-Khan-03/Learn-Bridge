import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, BookOpen, Search, Video, Star, Calendar, Settings, LogOut, Menu, X, Users, BarChart2, BookmarkCheck, Shield } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, role = "student" }) => {
  const { user } = useSelector(state => state.auth);
  
  const studentNavItems = [
    { name: "Dashboard", icon: Home, path: "/student/dashboard" },
    { name: "Courses", icon: BookOpen, path: "/student/catalog" },
    { name: "Search", icon: Search, path: "/student/search" },
    { name: "Meetings", icon: Video, path: "/student/meetings" },
    { name: "Reviews", icon: Star, path: "/student/reviews" },
    { name: "Profile", icon: Settings, path: "/student/profile" },
  ];

  const tutorNavItems = [
    { name: "Dashboard", icon: Home, path: "/tutor/dashboard" },
    { name: "My Courses", icon: BookOpen, path: "/tutor/catalog" },
    { name: "Upcoming Sessions", icon: Calendar, path: "/tutor/meetings" },
    { name: "Find Students", icon: Search, path: "/tutor/search" },
    { name: "Profile", icon: Settings, path: "/tutor/profile" },
  ];

  const adminNavItems = [
    { name: "Dashboard", icon: BarChart2, path: "/admin/dashboard" },
    { name: "User Management", icon: Users, path: "/admin/users" },
    { name: "Session Management", icon: Calendar, path: "/admin/sessions" },
    { name: "Course Management", icon: BookOpen, path: "/admin/courses" },
    { name: "Content Moderation", icon: BookmarkCheck, path: "/admin/content" },
    { name: "System Settings", icon: Settings, path: "/admin/settings" },
  ];

  const getNavItems = () => {
    if (role === "admin") return adminNavItems;
    if (role === "tutor") return tutorNavItems;
    return studentNavItems;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed z-50 bottom-4 right-4 md:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg"
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
            <h1 className="text-xl font-bold text-blue-600 font-poppins">
              Learn-Bridge
              <span className="ml-2 text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                {role === "admin" ? "Admin" : role === "student" ? "Student" : "Tutor"}
              </span>
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
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}

            {role === "admin" && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin Tools
                  </h3>
                </div>
                <NavLink
                  to="/admin/security"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200 ${
                      isActive ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                >
                  <Shield className="w-5 h-5 mr-3" />
                  <span className="font-medium">Security Center</span>
                </NavLink>
              </div>
            )}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {user?.name ? (
                  <span className="font-medium">
                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <span className="font-medium">{role === "admin" ? "A" : role === "student" ? "S" : "T"}</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name || (role === "admin" ? "Admin" : role === "student" ? "Student" : "Tutor")}
                </p>
                <p className="text-xs text-gray-500">
                  {role === "admin" 
                    ? "Administrator" 
                    : role === "student" 
                      ? "Student" 
                      : (user?.expertise?.length > 0 ? `${user.expertise[0]} Tutor` : "Tutor")}
                </p>
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
                  localStorage.removeItem("token");
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

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;