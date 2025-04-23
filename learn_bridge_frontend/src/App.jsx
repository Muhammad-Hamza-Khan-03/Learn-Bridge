import React from 'react'
import { Routes, Route, Outlet } from "react-router-dom"
import AppWithTheme from './pages/Home/LandingPage'
import { ThemeProvider } from './components/ui/theme-context'
import SignupPage from './pages/auth/signupPage'
import SignInPage from './pages/auth/signinPage'
import Dashboard from './pages/student/Dashboard'
import CourseCatalog from '../src/pages/student/courseCatalog'
import CourseDetail from '../src/pages/student/courseDetail'
import Search from '../src/pages/student/Search'
import Meetings from './pages/student/ChatMeeting'
import ScheduleSession from '../src/pages/student/ScheduleSessions'
import SessionReview from '../src/pages/student/SessionReview'
import { Navigate } from 'react-router-dom'
import Reviews from "../src/pages/student/Reviews"
import { ToastProvider } from './components/ui/toastContextProvider'
import StudentLayout from "../src/components/layouts/studentLayout"
import TutorLayout from "../src/components/layouts/tutorLayout"
import TutorDashboard from "../src/pages/tutor/tutorDashboard"
import TutorCatalog from "../src/pages/tutor/tutorCatalog"
import TutorSearch from "../src/pages/tutor/tutorSearch"
import OfferSession from '../src/pages/tutor/OfferSession'
import TutorMeetings from './pages/tutor/tutorChatMeeting'
import UserProfile from './pages/UserProfile/UserProfile'
export default function App() {

  return (
    <ThemeProvider>
      <ToastProvider>
        <Routes>
          {/* todo: if its authenticated then direct to dashboard page */}
          <Route path="/" element={<AppWithTheme />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/student/catalog" element={<CourseCatalog />} />
            <Route path="/student/course/:courseId" element={<CourseDetail />} />
            <Route path="/student/search" element={<Search />} />
            <Route path="/student/meetings" element={<Meetings />} />
            <Route path="/student/reviews" element={<Reviews />} />
            <Route
              path="/student/course/:courseId"
              element={
                <CourseDetail />
              }
            />
            <Route
              path="/student/schedule/:tutorId"
              element={
                <ScheduleSession />
              }
            />
            <Route
              path="/student/review/:sessionId"
              element={
                <SessionReview />
              } />
          </Route>
          {/* TUtor */}
          <Route path="/tutor" element={<TutorLayout />}>
            <Route index element={<Navigate to="/tutor/dashboard" replace />} />
            <Route path="/tutor/dashboard" element={<TutorDashboard />} />
            <Route path="/tutor/catalog" element={<TutorCatalog />} />
            <Route path="/tutor/search" element={<TutorSearch />} />
            <Route path="/tutor/course/:courseId" element={<CourseDetail />} />
            <Route
              path="/tutor/schedule/:studentId"
              element={
                <OfferSession />
              }

            />
            <Route path="/tutor/meetings" element={<TutorMeetings />} />
          </Route>


          <Route
            path="/profile"
            element={
                <UserProfile />
              
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </ToastProvider>
    </ThemeProvider>
  )
}