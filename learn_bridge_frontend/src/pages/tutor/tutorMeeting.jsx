"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { Calendar, Filter, Search, ChevronDown, X, Video } from "lucide-react"
import { setUpcomingSessions, setSessionHistory, updateSession } from "../../redux/slices/SessionSlice"
import SessionCard from "../../components/page-components/sessionCard"

const TutorMeetings = () => {
  const dispatch = useDispatch()
  const { upcomingSessions, sessionHistory, isLoading, error } = useSelector((state) => state.sessions)

  const [activeTab, setActiveTab] = useState("upcoming")
  const [statusUpdating, setStatusUpdating] = useState(null)
  const [meetingLinkData, setMeetingLinkData] = useState({
    sessionId: null,
    meetingLink: "",
  })
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [localError, setLocalError] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    subject: "",
    search: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState("list") // 'list' or 'calendar'

  // Load data on initial render and when refresh is triggered
  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null)

        // Fetch upcoming sessions
        const upcomingResponse = await fetch("/api/sessions/upcoming", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!upcomingResponse.ok) {
          throw new Error("Failed to fetch upcoming sessions")
        }

        const upcomingData = await upcomingResponse.json()
        dispatch(setUpcomingSessions(upcomingData))

        // Fetch session history
        const historyResponse = await fetch("/api/sessions/history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!historyResponse.ok) {
          throw new Error("Failed to fetch session history")
        }

        const historyData = await historyResponse.json()
        dispatch(setSessionHistory(historyData))
      } catch (err) {
        console.error("Failed to load sessions:", err)
        setLocalError("Failed to load your sessions. Please try again.")
      }
    }

    loadData()
  }, [dispatch, refreshCount])

  // Add a manual refresh function
  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1)
  }

  const handleStatusChange = async (sessionId, status) => {
    if (status === "addLink") {
      openLinkModal(sessionId)
      return
    }

    setStatusUpdating(sessionId)

    try {
      const response = await fetch(`/api/sessions/${sessionId}/status`, {
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
      dispatch(updateSession(updatedSession))

      // Refresh the sessions
      handleRefresh()
    } catch (err) {
      console.error("Error updating status:", err)
      setLocalError("Failed to update session status. Please try again.")
    } finally {
      setStatusUpdating(null)
    }
  }

  const handleAddMeetingLink = async () => {
    if (meetingLinkData.meetingLink.trim()) {
      try {
        const response = await fetch(`/api/sessions/${meetingLinkData.sessionId}/meeting-link`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ meetingLink: meetingLinkData.meetingLink }),
        })

        if (!response.ok) {
          throw new Error("Failed to add meeting link")
        }

        const updatedSession = await response.json()
        dispatch(updateSession(updatedSession))

        setShowLinkModal(false)
        setMeetingLinkData({
          sessionId: null,
          meetingLink: "",
        })

        // Refresh the sessions
        handleRefresh()
      } catch (err) {
        console.error("Error adding meeting link:", err)
        setLocalError("Failed to add meeting link. Please try again.")
      }
    }
  }

  const openLinkModal = (sessionId) => {
    setMeetingLinkData({
      sessionId,
      meetingLink: "",
    })
    setShowLinkModal(true)
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      subject: "",
      search: "",
    })
  }

  const filteredSessions =
    (activeTab === "upcoming" ? upcomingSessions : sessionHistory)?.filter((session) => {
      return (
        (filters.status === "" || session.status === filters.status) &&
        (filters.subject === "" ||
          (session.subject && session.subject.toLowerCase().includes(filters.subject.toLowerCase()))) &&
        (filters.search === "" ||
          (session.subject && session.subject.toLowerCase().includes(filters.search.toLowerCase())) ||
          (session.student &&
            typeof session.student === "object" &&
            session.student.name &&
            session.student.name.toLowerCase().includes(filters.search.toLowerCase())))
      )
    }) || []

  // Get unique subjects for filter dropdown
  const subjects = [...upcomingSessions, ...sessionHistory]
    .filter((session) => session && session.subject)
    .map((session) => session.subject)
    .filter((subject, index, self) => self.indexOf(subject) === index)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Session Management</h1>
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-[#3B82F6] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setView("list")}
          >
            List View
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "calendar"
                ? "bg-[#3B82F6] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setView("calendar")}
          >
            Calendar View
          </button>
          <button
            className="ml-2 p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {(error || localError) && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-rose-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-rose-700">{error || localError}</p>
            </div>
            <button className="ml-auto pl-3" onClick={() => setLocalError(null)}>
              <X className="h-5 w-5 text-rose-500" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "upcoming"
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Sessions
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Session History
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by subject or student name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <button
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} className="mr-2 text-gray-600" />
              <span className="font-medium text-gray-700">Filters</span>
              <ChevronDown
                size={16}
                className={`ml-2 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={filters.subject}
                  onChange={handleFilterChange}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
            </div>
          ) : view === "list" ? (
            filteredSessions.length > 0 ? (
              <div className="space-y-6">
                {filteredSessions.map((session) => (
                  <SessionCard key={session._id} session={session} onStatusChange={handleStatusChange} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No sessions found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search to find what you're looking for.
                </p>
                <Link
                  to="/tutor/search"
                  className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Find Students
                </Link>
              </div>
            )
          ) : (
            <div className="calendar-view">
              <div className="mb-6 text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Calendar View</h3>
                <p className="text-gray-500">
                  This view shows your sessions organized by date. Click on a day to see details.
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-medium text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, index) => {
                  const date = new Date()
                  date.setDate(date.getDate() - date.getDay() + index)

                  // Find sessions on this date
                  const sessionsOnDate = filteredSessions.filter(
                    (session) => new Date(session.date).toDateString() === date.toDateString(),
                  )

                  const isToday = new Date().toDateString() === date.toDateString()

                  return (
                    <div
                      key={index}
                      className={`p-2 min-h-[100px] rounded-lg border ${
                        isToday ? "border-[#3B82F6] bg-[#3B82F6] bg-opacity-5" : "border-gray-200"
                      } hover:border-[#3B82F6] transition-colors`}
                    >
                      <div className="text-right mb-1">
                        <span className={`text-sm ${isToday ? "font-bold text-[#3B82F6]" : "text-gray-700"}`}>
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {sessionsOnDate.slice(0, 2).map((session, idx) => (
                          <div
                            key={idx}
                            className="text-xs p-1 rounded bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] truncate cursor-pointer"
                            onClick={() => console.log("Session clicked:", session)}
                          >
                            {session.startTime} - {session.subject}
                          </div>
                        ))}
                        {sessionsOnDate.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">+{sessionsOnDate.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#3B82F6] bg-opacity-10 sm:mx-0 sm:h-10 sm:w-10">
                    <Video className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add Meeting Link</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Enter a Zoom, Google Meet, or other video conferencing link for this session.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                          Meeting URL
                        </label>
                        <input
                          type="url"
                          id="meetingLink"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] sm:text-sm"
                          placeholder="https://zoom.us/j/123456789"
                          value={meetingLinkData.meetingLink}
                          onChange={(e) =>
                            setMeetingLinkData({
                              ...meetingLinkData,
                              meetingLink: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#3B82F6] text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddMeetingLink}
                >
                  Save Link
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowLinkModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorMeetings
