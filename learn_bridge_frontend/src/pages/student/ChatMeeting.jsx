import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { Video, MessageSquare, Calendar, X, CheckCircle, Clock, Star, RefreshCw } from "lucide-react"
import {
  setUpcomingSessions,
  setSessionHistory,
  setLoading,
  setError,
  updateSession,
} from "../../redux/slices/SessionSlice"

  const BASE_URL = "http://localhost:5000/api"
const Meetings = () => {
  const dispatch = useDispatch()
  const { upcomingSessions, sessionHistory, isLoading, error } = useSelector((state) => state.sessions)

  const [activeTab, setActiveTab] = useState("upcoming")
  const [statusUpdating, setStatusUpdating] = useState(null)
  const [localError, setLocalError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load data on initial render
  useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true)
      try {
        dispatch(setLoading())
    
        // Fetch upcoming sessions using real API
        console.log("Fetching upcoming sessions from API")
        const upcomingResponse = await fetch(`${BASE_URL}/sessions/upcoming`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
    
        if (!upcomingResponse.ok) {
          throw new Error("Failed to fetch upcoming sessions")
        }
    
        const upcomingData = await upcomingResponse.json()
        dispatch(setUpcomingSessions(upcomingData.data || []))
    
        // Fetch session history using real API
        console.log("Fetching session history from API")
        const historyResponse = await fetch(`${BASE_URL}/sessions/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
    
        if (!historyResponse.ok) {
          throw new Error("Failed to fetch session history")
        }
    
        const historyData = await historyResponse.json()
        dispatch(setSessionHistory(historyData.data || []))
      } catch (error) {
        console.error("Error fetching sessions:", error)
        dispatch(setError(error.message || "An error occurred while fetching sessions"))
        setLocalError("Failed to load your sessions. Please try again.")
      } finally {
        setIsRefreshing(false)
      }
    }

    fetchData()
    
  }, [dispatch])

  // Add a manual refresh function
  const handleRefresh = () => {
    // const fetchData = async () => {
    //   setIsRefreshing(true)
    //   try {
    //     // Fetch upcoming sessions
    //     const upcomingData = await mockApi.sessions.getUpcomingSessions()
    //     dispatch(setUpcomingSessions(upcomingData.data))

    //     // Fetch session history
    //     const historyData = await mockApi.sessions.getSessionHistory()
    //     dispatch(setSessionHistory(historyData.data))
    //   } catch (error) {
    //     setLocalError("Failed to refresh sessions. Please try again.")
    //   } finally {
    //     setIsRefreshing(false)
    //   }
    // }
    const fetchData = async () => {
      setIsRefreshing(true)
      try {
        dispatch(setLoading())
    
        // Fetch upcoming sessions using real API
        console.log("Fetching upcoming sessions from API")
        const upcomingResponse = await fetch(`${BASE_URL}/sessions/upcoming`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
    
        if (!upcomingResponse.ok) {
          throw new Error("Failed to fetch upcoming sessions")
        }
    
        const upcomingData = await upcomingResponse.json()
        dispatch(setUpcomingSessions(upcomingData.data || []))
    
        // Fetch session history using real API
        console.log("Fetching session history from API")
        const historyResponse = await fetch(`${BASE_URL}/sessions/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
    
        if (!historyResponse.ok) {
          throw new Error("Failed to fetch session history")
        }
    
        const historyData = await historyResponse.json()
        dispatch(setSessionHistory(historyData.data || []))
      } catch (error) {
        console.error("Error fetching sessions:", error)
        dispatch(setError(error.message || "An error occurred while fetching sessions"))
        setLocalError("Failed to load your sessions. Please try again.")
      } finally {
        setIsRefreshing(false)
      }
    }
    fetchData()
  }

  const handleStatusChange = async (sessionId, status) => {
    setStatusUpdating(sessionId)
    try {
      // Update session status using real API
      const response = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
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
  
      const data = await response.json()
      dispatch(updateSession(data.data))
      handleRefresh() // Refresh the sessions after status update
    } catch (error) {
      setLocalError("Failed to update session status. Please try again.")
    } finally {
      setStatusUpdating(null)
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (err) {
      console.error("Date formatting error:", err)
      return "Invalid date"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">Pending</span>
      case "accepted":
        return (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">Accepted</span>
        )
      case "rejected":
        return <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">Rejected</span>
      case "completed":
        return (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium">Completed</span>
        )
      case "cancelled":
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Cancelled</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Unknown</span>
    }
  }

  // Helper function to safely get tutor name
  const getTutorName = (session) => {
    try {
      if (!session) return "Tutor"

      if (session.tutor) {
        if (typeof session.tutor === "object" && session.tutor.name) {
          return session.tutor.name
        }
        if (typeof session.tutor === "string") {
          return "Tutor"
        }
      }

      return "Tutor"
    } catch (err) {
      console.error("Error getting tutor name:", err)
      return "Tutor"
    }
  }

  // Helper function to check if chat link should be enabled
  const isChatLinkEnabled = (session) => {
    try {
      return session && session.tutor && typeof session.tutor === "object" && session.tutor._id
    } catch (err) {
      console.error("Error checking chat link:", err)
      return false
    }
  }

  // Helper function to get tutor ID for chat link
  const getChatLinkId = (session) => {
    try {
      if (!session || !session.tutor) return ""

      if (typeof session.tutor === "object" && session.tutor._id) {
        return session.tutor._id
      }

      if (typeof session.tutor === "string") {
        return session.tutor
      }

      return ""
    } catch (err) {
      console.error("Error getting chat ID:", err)
      return ""
    }
  }

  const renderSessionCard = (session, isPast = false) => {
    const statusColors = {
      pending: "bg-amber-100 text-amber-600",
      accepted: "bg-indigo-100 text-indigo-600",
      completed: "bg-emerald-100 text-emerald-600",
      cancelled: "bg-gray-100 text-gray-600",
      rejected: "bg-rose-100 text-rose-600",
    }

    const statusIcons = {
      pending: Calendar,
      accepted: CheckCircle,
      completed: CheckCircle,
      cancelled: X,
      rejected: X,
    }

    const StatusIcon = statusIcons[session.status] || Calendar

    return (
      <div
        key={session._id}
        className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md mb-4"
      >
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 mr-3">{session.subject || "Untitled Session"}</h3>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusColors[session.status] || "bg-gray-100 text-gray-600"}`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </div>
            </div>
            <p className="text-gray-600 mb-1">
              <strong>Tutor:</strong> {getTutorName(session)}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                {formatDate(session.date)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                {session.startTime || "Not set"} - {session.endTime || "Not set"}
              </div>
            </div>
            {session.notes && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Notes:</strong> {session.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            {session.status === "accepted" && (
              <>
                {session.meetingLink ? (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </a>
                ) : (
                  <Link
                    to={`/video/${session._id}`}
                    className="bg-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Start Video
                  </Link>
                )}
                <Link
                  to={isChatLinkEnabled(session) ? `/chat/${getChatLinkId(session)}` : "#"}
                  className={`bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center ${!isChatLinkEnabled(session) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with Tutor
                </Link>
              </>
            )}

            {session.status === "pending" && (
              <button
                className="bg-rose-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors flex items-center justify-center"
                onClick={() => handleStatusChange(session._id, "cancelled")}
                disabled={statusUpdating === session._id}
              >
                {statusUpdating === session._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel Session
                  </>
                )}
              </button>
            )}

            {session.status === "completed" && (
              <Link
                to={`/student/review/${session._id}`}
                className="bg-white border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center"
              >
                <Star className="w-4 h-4 mr-2" />
                Leave Review
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Sessions</h1>
        <button
          className="flex items-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </button>
      </div>

      {(error || localError) && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg flex justify-between items-center">
          <div>{error || localError}</div>
          <button className="text-rose-600 hover:text-rose-800" onClick={() => setLocalError(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "upcoming"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Sessions
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Session History
        </button>
      </div>

      {/* Session Cards */}
      <div>
        {isLoading || isRefreshing ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : activeTab === "upcoming" ? (
          upcomingSessions && upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => renderSessionCard(session))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No upcoming sessions</h3>
              <p className="text-gray-500 mb-6">Schedule a session with a tutor to get started.</p>
              <Link
                to="/student/search"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Find Tutors
              </Link>
            </div>
          )
        ) : sessionHistory && sessionHistory.length > 0 ? (
          sessionHistory.map((session) => renderSessionCard(session, true))
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No session history</h3>
            <p className="text-gray-500">Your completed and cancelled sessions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Meetings
