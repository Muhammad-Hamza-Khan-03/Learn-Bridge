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
import ChatRoom from './pages/shared-sockets/ChatRoom'
import VideoRoom from './pages/shared-sockets/VideoRoom'

// import JoinForm from './pages/shared-sockets/joinform'
import { useEffect } from "react";
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore
} from "@100mslive/react-sdk";

export default function App() {

  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  
  useEffect(() => {
    window.onunload = () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected]);



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
          {/* shared */}
          <Route path="/chat/:userId" element={<ChatRoom />} />
          
          <Route path="/video/:sessionId" element={<VideoRoom />} />
          {/* none */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        {/* <div className="App">
      <Header />
      {isConnected ? (
        <>
          <Conference />
          <Footer />
        </>
      ) : (
        <JoinForm />
      )}
    </div> */}

      </ToastProvider>
    </ThemeProvider>
  )
}