import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../page-components/Sidebar"

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} role="student" />
      
      <div className="flex-1 overflow-auto transition-all duration-300 md:ml-64">
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default StudentLayout
