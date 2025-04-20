import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { Calendar, Clock, BookOpen, BarChart, ChevronRight, Search } from "lucide-react"
import CalendarComponent from "../../components/page-components/Calender"
import StatsCard from "../../components/page-components/StatsCard"
import CourseProgressCard from "../../components/page-components/CourseProgressCard"
import UpcomingSessionCard from "../../components/page-components/UpcomingSessionCard"
import { setUpcomingSessions, setError, setLoading } from "../../redux/slices/SessionSlice"
import { setStudentCourses } from "../../redux/slices/courseSlice"

const BASE_URL = "https://api.example.com"

// API endpoints
export const API_URLS = {
  AUTH: `${BASE_URL}/auth`,
  USERS: `${BASE_URL}/users`,
  SESSIONS: `${BASE_URL}/sessions`,
  COURSES: `${BASE_URL}/courses`,
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { upcomingSessions, isLoading: sessionsLoading } = useSelector((state) => state.sessions)
  const { studentCourses, isLoading: coursesLoading } = useSelector((state) => state.courses)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        // Fetch upcoming sessions
        dispatch(setLoading())
        const sessionsResponse = await fetch(`${API_URLS.SESSIONS}/upcoming`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!sessionsResponse.ok) {
          throw new Error("Failed to fetch upcoming sessions")
        }

        const sessionsData = await sessionsResponse.json()
        dispatch(setUpcomingSessions(sessionsData.data))

        // Fetch student courses
        const coursesResponse = await fetch(`${API_URLS.COURSES}/student/enrolled`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch student courses")
        }

        const coursesData = await coursesResponse.json()
        dispatch(setStudentCourses(coursesData.data))
      } catch (error) {
        dispatch(setError(error.message))
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [dispatch])

  const stats = [
    {
      title: "Total Hours",
      value: "42",
      icon: Clock,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Courses Enrolled",
      value: studentCourses?.length || "0",
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Upcoming Sessions",
      value: upcomingSessions?.length || "0",
      icon: Calendar,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Overall Progress",
      value: "68%",
      icon: BarChart,
      color: "bg-blue-100 text-blue-600",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || "Student"}!</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Sessions</h2>
            <Link
              to="/meetings"
              className="text-indigo-600 text-sm font-medium flex items-center hover:text-indigo-700 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {isLoadingData || sessionsLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : upcomingSessions && upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 3).map((session) => (
                <UpcomingSessionCard
                  key={session._id}
                  session={{
                    id: session._id,
                    subject: session.subject,
                    tutor: session.tutor?.name || "Tutor",
                    date: session.date,
                    time: `${session.startTime} - ${session.endTime}`,
                    imageUrl: "/placeholder.svg?height=50&width=50",
                    status: session.status,
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming sessions</p>
                <Link
                  to="/search"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Find Tutors
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Calendar</h2>
          <CalendarComponent />
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">My Courses</h2>
          <Link
            to="/courses"
            className="text-indigo-600 text-sm font-medium flex items-center hover:text-indigo-700 transition-colors"
          >
            View All Courses <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {isLoadingData || coursesLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : studentCourses && studentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentCourses.slice(0, 3).map((course) => (
              <CourseProgressCard
                key={course._id}
                course={{
                  id: course._id,
                  title: course.title,
                  progress: 75, // This would need to come from the API
                  totalLessons: 12, // This would need to come from the API
                  completedLessons: 9, // This would need to come from the API
                  level: course.level,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
            <Link
              to="/courses"
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/search"
            className="bg-indigo-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Search className="w-5 h-5 mr-2" />
            Find Tutors
          </Link>
          <Link
            to="/courses"
            className="bg-emerald-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Browse Courses
          </Link>
          <Link
            to="/meetings"
            className="bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            View Meetings
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
