import React from 'react'
import { Routes, Route } from "react-router-dom"
import AppWithTheme from './pages/Home/LandingPage'
import { ThemeProvider } from './components/ui/theme-context'
import SignupPage from './pages/auth/signupPage'
import SignInPage from './pages/auth/signinPage'
import Dashboard from './pages/student/Dashboard'
import CourseCatalog from '../src/pages/student/courseCatalog'
import CourseDetail from '../src/pages/student/courseDetail'
import Search from '../src/pages/student/Search'
import Meetings from '../src/pages/student/Meeting'
import ScheduleSession from '../src/pages/student/ScheduleSessions'
import SessionReview from '../src/pages/student/SessionReview'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../src/components/page-components/Sidebar'
import { Navigate } from 'react-router-dom'

import { ToastProvider } from './components/ui/toastContextProvider'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  // Define paths that should NOT show the sidebar
  const hideSidebarRoutes = ["/", "/signup", "/signin"]
  const hideSidebar = hideSidebarRoutes.includes(location.pathname)

  return (
    <ThemeProvider>
      <ToastProvider>
        {/* Different layout for landing/auth pages vs dashboard pages */}
        {hideSidebar ? (
          <Routes>
            <Route path="/" element={<AppWithTheme />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            
            {/* Main Content */}
            <div className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
              <main className="p-6 md:p-8">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/courses" element={<CourseCatalog />} />
                  <Route path="/course/:courseId" element={<CourseDetail />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/meetings" element={<Meetings />} />
                  <Route path="/schedule/:tutorId" element={<ScheduleSession />} />
                  <Route path="/review/:sessionId" element={<SessionReview />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        )}
      </ToastProvider>
    </ThemeProvider>
  )
}