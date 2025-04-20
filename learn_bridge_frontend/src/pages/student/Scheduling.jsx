"use client"

import { useState } from "react"
import { Calendar, Clock, User, BookOpen, MessageSquare, ChevronLeft, ChevronRight, Star } from "lucide-react"

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTutor, setSelectedTutor] = useState(null)

  // Sample data
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English Literature",
    "History",
    "Computer Science",
  ]

  const tutors = [
    {
      id: 1,
      name: "Dr. Sarah Williams",
      subjects: ["Mathematics"],
      rating: 4.8,
      reviews: 124,
      imageUrl: "/placeholder.svg?height=50&width=50",
      availability: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      subjects: ["Physics"],
      rating: 4.6,
      reviews: 98,
      imageUrl: "/placeholder.svg?height=50&width=50",
      availability: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
    },
    {
      id: 3,
      name: "Dr. Emily Johnson",
      subjects: ["English Literature"],
      rating: 4.9,
      reviews: 156,
      imageUrl: "/placeholder.svg?height=50&width=50",
      availability: ["9:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
    },
  ]

  // Filter tutors based on selected subject
  const filteredTutors = selectedSubject ? tutors.filter((tutor) => tutor.subjects.includes(selectedSubject)) : []

  // Get available time slots for selected tutor
  const availableTimeSlots = selectedTutor ? selectedTutor.availability : []

  // Calendar functions
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateSelect = (year, month, day) => {
    const selected = new Date(year, month, day)
    setSelectedDate(selected)
    setSelectedTime(null) // Reset time when date changes
  }

  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor)
    setSelectedTime(null) // Reset time when tutor changes
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday =
        new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year

      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
            isPast
              ? "text-gray-400 cursor-not-allowed"
              : isSelected
                ? "bg-indigo-600 text-white font-medium"
                : isToday
                  ? "bg-indigo-100 text-indigo-600 font-medium"
                  : "hover:bg-gray-100"
          }`}
          onClick={() => !isPast && handleDateSelect(year, month, day)}
        >
          <span className="text-sm">{day}</span>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Schedule a Session</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Select Date & Time</h2>

          {/* Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-md font-medium text-gray-800">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={index} className="text-xs font-medium text-gray-500 text-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>

          {/* Time Slots */}
          {selectedDate && selectedTutor && (
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Available Time Slots</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableTimeSlots.map((time, index) => (
                  <button
                    key={index}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === time ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Session Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Session Details</h2>

          {/* Subject Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setSelectedTutor(null)
                setSelectedTime(null)
              }}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Tutor Selection */}
          {selectedSubject && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Tutor</label>
              <div className="space-y-3">
                {filteredTutors.length > 0 ? (
                  filteredTutors.map((tutor) => (
                    <div
                      key={tutor.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedTutor && selectedTutor.id === tutor.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleTutorSelect(tutor)}
                    >
                      <div className="flex items-center">
                        <img
                          src={tutor.imageUrl || "/placeholder.svg"}
                          alt={tutor.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{tutor.name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="w-4 h-4 text-amber-500 mr-1" />
                            <span>
                              {tutor.rating} ({tutor.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No tutors available for this subject.</p>
                )}
              </div>
            </div>
          )}

          {/* Session Summary */}
          {selectedDate && selectedTime && selectedTutor && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium text-gray-800 mb-3">Session Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                  <span>
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                  <span>{selectedTime}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-5 h-5 mr-3 text-indigo-600" />
                  <span>{selectedTutor.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-5 h-5 mr-3 text-indigo-600" />
                  <span>{selectedSubject}</span>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any specific topics or questions you'd like to cover..."
                ></textarea>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Session
                </button>
                <button className="flex-none bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Message Tutor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Scheduling
