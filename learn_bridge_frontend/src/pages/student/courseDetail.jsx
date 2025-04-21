import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Calendar, Clock, User, ChevronLeft, Star } from "lucide-react"
import { setCourse, setLoading, setError, updateCourseInState } from "../../redux/slices/courseSlice"


const BASE_URL = "http://localhost:5000/api"
// API endpoints
export const API_URLS = {
  AUTH: `${BASE_URL}/auth`,
  USERS: `${BASE_URL}/users`,
  SESSIONS: `${BASE_URL}/sessions`,
  COURSES: `${BASE_URL}/courses`,
}


const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { course, isLoading, error } = useSelector((state) => state.courses)
  const { user } = useSelector((state) => state.auth)
  const [enrolling, setEnrolling] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchCourse = async () => {
      dispatch(setLoading())
      try {
        const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
    
        if (!response.ok) {
          throw new Error("Failed to fetch course")
        }
    
        const data = await response.json()
        dispatch(setCourse(data.data))
      } catch (error) {
        dispatch(setError(error.message))
      }
    }
    

    fetchCourse()
  }, [dispatch, courseId])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      const response = await fetch(`${BASE_URL}/courses/${courseId}/enroll`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
  
      if (!response.ok) {
        throw new Error("Failed to enroll in course")
      }
  
      const data = await response.json()
      dispatch(updateCourseInState(data.data))
      setSuccessMessage("Successfully enrolled in course!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrorMessage(error.message || "Failed to enroll in course")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setEnrolling(false)
    }
  }

  const isEnrolled = course?.enrolledStudents?.some((student) => student._id === user?._id || student === user?._id)

  const formatTimings = (timings) => {
    if (!timings || !Array.isArray(timings) || timings.length === 0) {
      return "Schedule not available"
    }
    return timings.map((timing) => `${timing.day}: ${timing.startTime} - ${timing.endTime}`).join(", ")
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating || 0) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-rose-50 text-rose-600 p-4 rounded-lg">{error}</div>
  }

  if (!course) {
    return <div className="bg-amber-50 text-amber-600 p-4 rounded-lg">Course not found.</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <button
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 ml-4">{course.title}</h1>
      </div>

      {successMessage && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg">{successMessage}</div>}

      {errorMessage && <div className="bg-rose-50 text-rose-600 p-4 rounded-lg">{errorMessage}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">{course.subject}</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{course.level}</span>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-700 mb-6">{course.description}</p>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p>{course.duration} weeks</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p>{new Date(course.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p>{new Date(course.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                <div>
                  <p className="font-medium">Schedule</p>
                  <p className="text-sm">{formatTimings(course.timings)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content or Syllabus could go here */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">What You'll Learn</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="bg-indigo-100 text-indigo-600 p-1 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Comprehensive understanding of {course.subject} fundamentals</span>
              </li>
              <li className="flex items-start">
                <div className="bg-indigo-100 text-indigo-600 p-1 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Practical skills applicable to real-world scenarios</span>
              </li>
              <li className="flex items-start">
                <div className="bg-indigo-100 text-indigo-600 p-1 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Advanced techniques for {course.level} level students</span>
              </li>
              <li className="flex items-start">
                <div className="bg-indigo-100 text-indigo-600 p-1 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Personalized feedback from an experienced instructor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Enrollment</h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Available Spots:</strong> {course.maxStudents - course.enrolledStudents.length} of{" "}
                {course.maxStudents}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${(course.enrolledStudents.length / course.maxStudents) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {user?.role === "student" && (
              <button
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                disabled={isEnrolled || course.enrolledStudents.length >= course.maxStudents || enrolling}
                onClick={handleEnroll}
              >
                {enrolling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enrolling...
                  </>
                ) : isEnrolled ? (
                  "Already Enrolled"
                ) : course.enrolledStudents.length >= course.maxStudents ? (
                  "Course Full"
                ) : (
                  "Enroll Now"
                )}
              </button>
            )}
          </div>

          {/* Tutor Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Instructor</h2>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{course.tutor.name}</h3>
                {course.tutor.averageRating > 0 && (
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-1">{course.tutor.averageRating.toFixed(1)}</span>
                    {renderStars(course.tutor.averageRating)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {Array.isArray(course.tutor.expertise) && course.tutor.expertise.length > 0 && (
                <p className="text-sm text-gray-700">
                  <strong>Expertise:</strong> {course.tutor.expertise.join(", ")}
                </p>
              )}

              {course.tutor.experience && (
                <p className="text-sm text-gray-700">
                  <strong>Experience:</strong> {course.tutor.experience} years
                </p>
              )}

              {course.tutor.education && (
                <p className="text-sm text-gray-700">
                  <strong>Education:</strong> {course.tutor.education}
                </p>
              )}
            </div>

            <Link
              to={`/tutor/${course.tutor._id}`}
              className="block w-full text-center bg-white border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
