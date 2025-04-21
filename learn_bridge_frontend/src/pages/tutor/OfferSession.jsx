"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { ChevronLeft, Calendar, Clock, User, MapPin, AlertCircle } from "lucide-react"
import { setCurrentStudent } from "../../redux/slices/UserSlice"
import { setLoading, setError, addSession } from "../../redux/slices/SessionSlice"


const OfferSession = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentStudent, isLoading: studentLoading } = useSelector((state) => state.users)
  const { user } = useSelector((state) => state.auth)
  const { isLoading: sessionLoading, success, error } = useSelector((state) => state.sessions)

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
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (studentId) {
        try {
          // Changed from /api/students/:id to the correct endpoint
          const response = await fetch(`/api/users/students/${studentId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
  
          if (!response.ok) {
            throw new Error("Student not found")
          }
  
          const data = await response.json()
          dispatch(setCurrentStudent(data.data)) // Note the .data property
        } catch (err) {
          setLocalError("Student not found: " + (err?.message || "Unknown error"))
        }
      }
    }
  
    fetchStudentProfile()
  }, [dispatch, studentId])

  useEffect(() => {
    if (success) {
      navigate("/tutor/meetings")
    }
  }, [success, navigate])

  useEffect(() => {
    if (user && user.availability) {
      // Group availability by day
      const availabilityByDay = {}

      user.availability.forEach((slot) => {
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
  }, [user])

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

      if (selectedDate < today) {
        errors.date = "Date cannot be in the past"
      }
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
      const sessionData = {
        student: studentId,
        subject: formData.subject,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
        initiatedBy: "tutor",
      }
  
      try {
        dispatch(setLoading())
  
        const response = await fetch("http://localhost:5000/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(sessionData),
        })
  
        if (!response.ok) {
          throw new Error("Failed to create session")
        }
  
        const newSession = await response.json()
        dispatch(addSession(newSession.data)) // Note the .data property
      } catch (error) {
        dispatch(setError(error.message))
      }
    }
  }

  if (studentLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    )
  }

  if (!currentStudent) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">Student not found.</p>
          </div>
        </div>
      </div>
    )
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
        <h1 className="text-2xl font-bold text-gray-800 ml-4 font-poppins">Offer Session to {currentStudent.name}</h1>
      </div>

      {(error || localError) && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-rose-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-rose-700">{error || localError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 font-poppins">Student Information</h2>

          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#6366F1] flex items-center justify-center text-white mr-4">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{currentStudent.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                {currentStudent.country || "Location not specified"}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Goals</h3>
              <ul className="space-y-2">
                {currentStudent.learningGoals && currentStudent.learningGoals.length > 0 ? (
                  currentStudent.learningGoals.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] p-1 rounded-full mr-2 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">{goal}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 italic">No learning goals specified</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preferred Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {currentStudent.preferredSubjects && currentStudent.preferredSubjects.length > 0 ? (
                  currentStudent.preferredSubjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-[#3B82F6] bg-opacity-10 text-[#3B82F6]"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">No preferred subjects specified</span>
                )}
              </div>
            </div>

            {currentStudent.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">About</h3>
                <p className="text-sm text-gray-600">{currentStudent.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Session Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 font-poppins">Session Details</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className={`w-full p-2 rounded-lg border ${
                    formErrors.subject ? "border-rose-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What subject will you teach?"
                />
                {formErrors.subject && <p className="mt-1 text-sm text-rose-500">{formErrors.subject}</p>}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className={`w-full pl-10 p-2 rounded-lg border ${
                      formErrors.date ? "border-rose-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {formErrors.date && <p className="mt-1 text-sm text-rose-500">{formErrors.date}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="day"
                  className="w-full pl-10 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="startTime"
                    name="startTime"
                    className={`w-full pl-10 p-2 rounded-lg border ${
                      formErrors.startTime ? "border-rose-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
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
                </div>
                {formErrors.startTime && <p className="mt-1 text-sm text-rose-500">{formErrors.startTime}</p>}
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="endTime"
                    name="endTime"
                    className={`w-full pl-10 p-2 rounded-lg border ${
                      formErrors.endTime ? "border-rose-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
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
                </div>
                {formErrors.endTime && <p className="mt-1 text-sm text-rose-500">{formErrors.endTime}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any specific topics you'd like to cover in this session?"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center"
                disabled={sessionLoading}
              >
                {sessionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Offering Session...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Offer Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OfferSession
