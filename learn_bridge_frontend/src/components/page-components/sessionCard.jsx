"use client"

import { Calendar, Clock, Video, MessageSquare, User, CheckCircle, XCircle } from "lucide-react"
import { Link } from "react-router-dom"

const SessionCard = ({ session, onStatusChange }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-600">Pending</span>
      case "accepted":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#3B82F6] bg-opacity-10 text-[#3B82F6]">
            Accepted
          </span>
        )
      case "rejected":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-600">Rejected</span>
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">Completed</span>
        )
      case "cancelled":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Cancelled</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Unknown</span>
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (err) {
      console.error("Date formatting error:", err)
      return "Invalid date"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white mr-4">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 font-poppins">
              {session.subject || "Untitled Session"}
            </h3>
            <p className="text-sm text-gray-600">with {session.student?.name || "Student"}</p>
          </div>
        </div>
        <div>{getStatusBadge(session.status)}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-[#6366F1]" />
          {formatDate(session.date)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-[#6366F1]" />
          {session.startTime || "Not set"} - {session.endTime || "Not set"}
        </div>
      </div>

      {session.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">Session Notes:</p>
          <p>{session.notes}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {session.status === "pending" && (
          <>
            <button
              onClick={() => onStatusChange(session._id, "accepted")}
              className="flex-1 bg-[#10B981] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </button>
            <button
              onClick={() => onStatusChange(session._id, "rejected")}
              className="flex-1 bg-rose-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>
          </>
        )}

        {session.status === "accepted" && (
          <>
            {session.meetingLink ? (
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#3B82F6] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
              >
                <Video className="w-4 h-4 mr-2" />
                Join Meeting
              </a>
            ) : (
              <>
                <Link
                  to={`/video/${session._id}`}
                  className="flex-1 bg-[#3B82F6] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Video
                </Link>
                <button
                  onClick={() => onStatusChange(session._id, "addLink")}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  Add Meeting Link
                </button>
              </>
            )}
          </>
        )}

        {session.status === "accepted" && (
          <Link
            to={`/tutor/chat/${session.student?._id || ""}`}
            className="flex-1 bg-white border border-[#6366F1] text-[#6366F1] py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#6366F1] hover:bg-opacity-5 transition-colors flex items-center justify-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Student
          </Link>
        )}

        {session.status === "accepted" && new Date(session.date) < new Date() && (
          <button
            onClick={() => onStatusChange(session._id, "completed")}
            className="flex-1 bg-white border border-[#10B981] text-[#10B981] py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#10B981] hover:bg-opacity-5 transition-colors flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  )
}

export default SessionCard
