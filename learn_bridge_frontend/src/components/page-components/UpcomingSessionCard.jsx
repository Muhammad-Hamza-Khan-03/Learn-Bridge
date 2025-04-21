import { Calendar, Clock, Video, MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"

const UpcomingSessionCard = ({ session }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-5 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center">
        <img src={session.imageUrl || "/placeholder.svg"} alt={session.tutor} className="w-12 h-12 rounded-full mr-4" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{session.subject}</h3>
          <p className="text-sm text-gray-500">with {session.tutor}</p>
        </div>
        {session.status && (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              session.status === "pending"
                ? "bg-amber-100 text-amber-600"
                : session.status === "accepted"
                  ? "bg-indigo-100 text-indigo-600"
                  : session.status === "completed"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-600"
            }`}
          >
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
          {new Date(session.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-indigo-600" />
          {session.time}
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        {session.status === "accepted" ? (
          <Link
            to={`/video/${session.id}`}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Session
          </Link>
        ) : session.status === "pending" ? (
          <Link
            to={`/student/meetings`}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Details
          </Link>
        ) : (
          <Link
            to={`/student/meetings`}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Details
          </Link>
        )}
        <Link
          to={`/chat/${session.id}`}
          className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Link>
      </div>
    </div>
  )
}

export default UpcomingSessionCard
