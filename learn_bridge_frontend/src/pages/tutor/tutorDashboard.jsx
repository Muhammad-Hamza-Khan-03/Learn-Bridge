import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { DollarSign, Calendar, Users, Star, ChevronRight, BookOpen, BarChart2 } from "lucide-react"
import { updateSession, setUpcomingSessions } from "../../redux/slices/SessionSlice"
import { setTutorCourses, removeCourse } from "../../redux/slices/courseSlice"
import StatsCard from "../../components/page-components/StatsCard"
import CalendarComponent from "../../components/page-components/Calender"
import SessionCard from "../../components/page-components/sessionCard"
import CourseCard from "../../components/page-components/CourseCard"

const TutorDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { upcomingSessions, isLoading: sessionsLoading } = useSelector((state) => state.sessions)
  const { tutorCourses, isLoading: coursesLoading } = useSelector((state) => state.courses)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming sessions
        const sessionsResponse = await fetch("http://localhost:5000/api/sessions/upcoming", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
  
        if (!sessionsResponse.ok) {
          throw new Error("Failed to fetch upcoming sessions")
        }
  
        const sessionsData = await sessionsResponse.json()
        dispatch(setUpcomingSessions(sessionsData.data)) // Note the .data property
  
        // Fetch tutor courses - Fix the endpoint
        const coursesResponse = await fetch("http://localhost:5000/api/courses/tutor/mycourses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
  
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses")
        }
  
        const coursesData = await coursesResponse.json()
        
        // Process and enrich course data before dispatching
        const enrichedCourses = coursesData.data.map(course => {
          // Add mock tutor information if needed 
          // In a real app, this would come from the API
          return {
            ...course,
            tutor: {
              name: user?.name || "Instructor",
              credentials: course.subject ? `${course.subject} Instructor` : "Tutor",
              image: null
            },
            // Add other properties needed by CourseCard component
            duration: course.duration ? `${course.duration} weeks` : "TBD",
            students: course.enrolledStudents?.length || 0,
            tags: course.subject ? [course.subject, course.level || "Beginner"] : [],
            rating: course.averageRating || 4.5,
            reviews: course.totalReviews || 0,
            // Use _id as id if needed
            id: course._id
          }
        });
        
        dispatch(setTutorCourses(enrichedCourses)) // Dispatch the enriched courses
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }
  
    fetchData()
  }, [dispatch, user?.name])
  

  const stats = [
    {
      title: "Upcoming Sessions",
      value: upcomingSessions?.length || 0,
      icon: Calendar,
      color: "bg-[#3B82F6] bg-opacity-10 text-[#3B82F6]",
      trend: "from last week",
      trendValue: 5,
    },
    
    {
      title: "Average Rating",
      value: "4.8",
      icon: Star,
      color: "bg-amber-100 text-amber-600",
      trend: "from last month",
      trendValue: 0.2,
    },
  ]

  const notifications = [
    {
      id: 1,
      title: "New session request",
      message: "Alex Johnson has requested a Math tutoring session",
      time: "2 hours ago",
      type: "session",
      read: false,
    },
    {
      id: 2,
      title: "Course enrollment",
      message: "3 new students enrolled in 'Advanced Calculus'",
      time: "Yesterday",
      type: "course",
      read: false,
    },
    {
      id: 3,
      title: "New review",
      message: "You received a 5-star review from Emily Parker",
      time: "2 days ago",
      type: "review",
      read: true,
    },
  ]

  const handleStatusChange = async (sessionId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to update session status")
      }
  
      const updatedSession = await response.json()
      dispatch(updateSession(updatedSession.data)) // Note the .data property
    } catch (error) {
      console.error("Error updating session status:", error)
    }
  }

  const handleEditCourse = (courseId) => {
    console.log(`Edit course ${courseId}`)
  }

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      dispatch(removeCourse(courseId))
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Welcome, {user?.name || "Tutor"}!</h1>
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 font-poppins">Upcoming Sessions</h2>
              <Link
                to="/tutor/meetings"
                className="text-[#3B82F6] text-sm font-medium flex items-center hover:text-opacity-80 transition-colors"
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
                </div>
              ) : upcomingSessions && upcomingSessions.length > 0 ? (
                upcomingSessions
                  .slice(0, 2)
                  .map((session) => (
                    <SessionCard key={session._id} session={session} onStatusChange={handleStatusChange} />
                  ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No upcoming sessions</p>
                  <Link
                    to="/tutor/search"
                    className="bg-[#3B82F6] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                  >
                    Find Students
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 font-poppins">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              <div className="relative pl-6 pb-6 border-l-2 border-gray-200">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-[#3B82F6]"></div>
                <div className="mb-1">
                  <span className="text-sm font-medium text-gray-800">New session scheduled</span>
                  <span className="text-xs text-gray-500 ml-2">Today, 10:30 AM</span>
                </div>
                <p className="text-sm text-gray-600">Math tutoring session with Alex Johnson</p>
              </div>
              <div className="relative pl-6 pb-6 border-l-2 border-gray-200">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-emerald-500"></div>
                <div className="mb-1">
                  <span className="text-sm font-medium text-gray-800">Course created</span>
                  <span className="text-xs text-gray-500 ml-2">Yesterday</span>
                </div>
                <p className="text-sm text-gray-600">Created "Introduction to Physics" course</p>
              </div>
              <div className="relative pl-6 pb-6 border-l-2 border-gray-200">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-amber-500"></div>
                <div className="mb-1">
                  <span className="text-sm font-medium text-gray-800">New review received</span>
                  <span className="text-xs text-gray-500 ml-2">2 days ago</span>
                </div>
                <p className="text-sm text-gray-600">Emily Parker gave you a 5-star review</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-[#6366F1]"></div>
                <div className="mb-1">
                  <span className="text-sm font-medium text-gray-800">Session completed</span>
                  <span className="text-xs text-gray-500 ml-2">3 days ago</span>
                </div>
                <p className="text-sm text-gray-600">Completed English session with Michael Brown</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 font-poppins">Calendar</h2>
            <CalendarComponent
              events={upcomingSessions || []}
              onDateClick={(date, events) => console.log(date, events)}
            />
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 font-poppins">Notifications</h2>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#3B82F6] text-white">
                {notifications.filter((n) => !n.read).length} New
              </span>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${notification.read ? "bg-gray-50" : "bg-[#3B82F6] bg-opacity-5 border-l-4 border-[#3B82F6]"}`}
                >
                  <div className="flex items-start">
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        notification.type === "session"
                          ? "bg-[#3B82F6] bg-opacity-10 text-[#3B82F6]"
                          : notification.type === "course"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {notification.type === "session" ? (
                        <Calendar className="w-4 h-4" />
                      ) : notification.type === "course" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{notification.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full text-center text-sm text-[#3B82F6] font-medium hover:text-opacity-80 transition-colors">
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 font-poppins">My Courses</h2>
          <Link
            to="/tutor/catalog"
            className="text-[#3B82F6] text-sm font-medium flex items-center hover:text-opacity-80 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {coursesLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : tutorCourses && tutorCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorCourses.slice(0, 3).map((course) => (
              <CourseCard key={course._id} course={course} onEdit={handleEditCourse} onDelete={handleDeleteCourse} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
            <Link
              to="/tutor/catalog"
              className="bg-[#3B82F6] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
            >
              Create Course
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 font-poppins">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/tutor/catalog"
            className="bg-[#3B82F6] text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Create Course
          </Link>
          <Link
            to="/tutor/search"
            className="bg-[#6366F1] text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Find Students
          </Link>
          
        </div>
      </div>
    </div>
  )
}

export default TutorDashboard
