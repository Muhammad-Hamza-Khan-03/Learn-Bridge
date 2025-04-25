import { useState, useEffect } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Calendar, Clock, User, BookOpen, MessageSquare, ChevronLeft, Star } from "lucide-react"
import { setCurrentTutor, setLoading, setError } from "../../redux/slices/UserSlice"
import {
  addSession,
  setLoading as setSessionLoading,
  setError as setSessionError,
  setUpcomingSessions
} from "../../redux/slices/SessionSlice"

const BASE_URL = "http://localhost:5000/api"

// API endpoints
export const API_URLS = {
  AUTH: `${BASE_URL}/auth`,
  USERS: `${BASE_URL}/users`,
  SESSIONS: `${BASE_URL}/sessions`,
  COURSES: `${BASE_URL}/courses`,
}

const ScheduleSession = () => {
  const location = useLocation();

  const { tutorId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentTutor, isLoading: tutorLoading } = useSelector((state) => state.users)
  const { isLoading: sessionLoading, error: sessionError } = useSelector((state) => state.sessions)
  const [courseId, setCourseId] = useState(new URLSearchParams(location.search).get('course'));

  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  })

  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDay, setSelectedDay] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchTutorProfile = async () => {
      if (!tutorId) {
        navigate("/student/search")
        return
      }
      dispatch(setLoading())
      try {
        const response = await fetch(`${BASE_URL}/users/tutors/${tutorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch tutor profile")
        }

        const data = await response.json()
        dispatch(setCurrentTutor(data.data))
      } catch (error) {
        console.error("Error fetching tutor:", error)
        dispatch(setError(error.message))
        setTimeout(() => navigate("/student/search"), 3000)
      }
    }

    fetchTutorProfile()
  }, [dispatch, tutorId])

  useEffect(() => {
    if (currentTutor && currentTutor.availability) {
      // Group availability by day
      const availabilityByDay = {}

      currentTutor.availability.forEach((slot) => {
        if (!availabilityByDay[slot.day]) {
          availabilityByDay[slot.day] = []
        }
        availabilityByDay[slot.day].push({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })
      })

      setAvailableSlots(availabilityByDay)
    }
  }, [currentTutor])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear errors when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value)
    setFormData({
      ...formData,
      startTime: "",
      endTime: "",
    })
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required"
    }

    if (!formData.date) {
      errors.date = "Date is required"
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // if (selectedDate < today) {
      //   errors.date = "Date cannot be in the past"
      // }
    }

    if (!formData.startTime) {
      errors.startTime = "Start time is required"
    }

    if (!formData.endTime) {
      errors.endTime = "End time is required"
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        errors.endTime = "End time must be after start time"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      dispatch(setSessionLoading())
      try {
        const sessionData = {
          tutor: tutorId,
          subject: formData.subject,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          notes: formData.notes,
          ...(courseId && { course: courseId })
        }
        try {
          const response = await fetch(`${BASE_URL}/sessions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(sessionData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create session");
          }

          const data = await response.json()
          dispatch(addSession(data.data))
          setSuccess(true)
        } catch (error) {
          console.error("Session creation error:", error);
          throw new Error(error.message || "Failed to create session");
        }

        try {
          // Refresh the upcoming sessions list
          const sessionsResponse = await fetch(`${BASE_URL}/sessions/upcoming`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            if (sessionsData && sessionsData.data) {
              dispatch(setUpcomingSessions(sessionsData.data));
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing sessions:", refreshError);
          // Don't fail the whole operation if just the refresh fails
        }

        setTimeout(() => {
          navigate("/student/meetings")
        }, 2000)
      } catch (error) {
        console.error("Session creation error:", error);
        dispatch(setSessionError(error.message || "Failed to create session"))
      }
    }
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

  if (tutorLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!currentTutor) {
    return <div className="bg-amber-50 text-amber-600 p-4 rounded-lg">Tutor not found.</div>
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
        <h1 className="text-2xl font-bold text-gray-800 ml-4">Schedule Session with {currentTutor.name}</h1>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg">
          Session scheduled successfully! Redirecting to your sessions...
        </div>
      )}

      {sessionError && <div className="bg-rose-50 text-rose-600 p-4 rounded-lg">{sessionError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tutor Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Tutor Information</h2>

          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{currentTutor.name}</h3>
              {currentTutor.averageRating > 0 && (
                <div className="flex items-center">
                  <span className="text-gray-600 mr-1">{currentTutor.averageRating.toFixed(1)}</span>
                  {renderStars(currentTutor.averageRating)}
                  <span className="text-gray-500 text-sm ml-1">({currentTutor.totalReviews || 0})</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(currentTutor.expertise) ? (
                  currentTutor.expertise.map((subject, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-700">{currentTutor.expertise || "Not specified"}</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Hourly Rate</h4>
              <p className="text-gray-700 font-medium">${currentTutor.hourlyRate}/hour</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Experience</h4>
              <p className="text-gray-700">{currentTutor.experience} years</p>
            </div>

            {currentTutor.bio && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">About</h4>
                <p className="text-gray-700">{currentTutor.bio}</p>
              </div>
            )}
          </div>

          <Link
            to={`/tutor/${currentTutor._id}`}
            className="block w-full text-center bg-white border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
          >
            View Full Profile
          </Link>
        </div>

        {/* Right Column - Scheduling Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Session Details</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={`w-full p-3 rounded-lg border ${formErrors.subject ? "border-rose-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="What subject do you need help with?"
                value={formData.subject}
                onChange={handleChange}
              />
              {formErrors.subject && <p className="mt-1 text-sm text-rose-600">{formErrors.subject}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className={`w-full p-3 rounded-lg border ${formErrors.date ? "border-rose-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
              {formErrors.date && <p className="mt-1 text-sm text-rose-600">{formErrors.date}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                id="day"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedDay}
                onChange={handleDayChange}
              >
                <option value="">Select a day</option>
                {Object.keys(availableSlots).map((day, index) => (
                  <option key={index} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <select
                  id="startTime"
                  name="startTime"
                  className={`w-full p-3 rounded-lg border ${formErrors.startTime ? "border-rose-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  value={formData.startTime}
                  onChange={handleChange}
                  disabled={!selectedDay}
                >
                  <option value="">Select start time</option>
                  {selectedDay &&
                    availableSlots[selectedDay]?.map((slot, index) => (
                      <option key={index} value={slot.startTime}>
                        {slot.startTime}
                      </option>
                    ))}
                </select>
                {formErrors.startTime && <p className="mt-1 text-sm text-rose-600">{formErrors.startTime}</p>}
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <select
                  id="endTime"
                  name="endTime"
                  className={`w-full p-3 rounded-lg border ${formErrors.endTime ? "border-rose-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  value={formData.endTime}
                  onChange={handleChange}
                  disabled={!selectedDay || !formData.startTime}
                >
                  <option value="">Select end time</option>
                  {selectedDay &&
                    formData.startTime &&
                    availableSlots[selectedDay]?.map(
                      (slot, index) =>
                        slot.endTime > formData.startTime && (
                          <option key={index} value={slot.endTime}>
                            {slot.endTime}
                          </option>
                        ),
                    )}
                </select>
                {formErrors.endTime && <p className="mt-1 text-sm text-rose-600">{formErrors.endTime}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Any specific topics or questions you'd like to cover?"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Session Summary */}
            {formData.date && formData.startTime && formData.endTime && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Session Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                    <span>
                      {new Date(formData.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                    <span>
                      {formData.startTime} - {formData.endTime}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-5 h-5 mr-3 text-indigo-600" />
                    <span>{currentTutor.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-5 h-5 mr-3 text-indigo-600" />
                    <span>{formData.subject}</span>
                  </div>
                </div>
              </div>
            )}
            {courseId && (
              <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                <p className="text-indigo-700 font-medium">This session will be linked to your enrolled course</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                disabled={sessionLoading}
              >
                {sessionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Session
                  </>
                )}
              </button>
              <Link
  to={`/chat/${tutorId}`}
  className="bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
>
  <MessageSquare className="w-5 h-5 mr-2" />
  Message Tutor
</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ScheduleSession
