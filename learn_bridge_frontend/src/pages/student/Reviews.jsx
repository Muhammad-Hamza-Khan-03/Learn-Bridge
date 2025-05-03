import { useState, useEffect } from "react"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import {Link} from "react-router-dom"
const Reviews = () => {
  const [filter, setFilter] = useState("all")
  const [reviews, setReviews] = useState([])
  const [pendingReviews, setPendingReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const BASE_URL = "http://localhost:5000/api"

  // Fetch reviews when component loads
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        // Fetch completed reviews
        const response = await fetch(`${BASE_URL}/reviews/student`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const data = await response.json()
        setReviews(data.data || [])

        // Fetch sessions that need reviews
        const sessionsResponse = await fetch(`${BASE_URL}/sessions/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!sessionsResponse.ok) {
          throw new Error("Failed to fetch sessions")
        }

        const sessionsData = await sessionsResponse.json()
        
        // Filter completed sessions that haven't been reviewed yet
        const completedSessions = sessionsData.data.filter(
          session => session.status === "completed"
        )
        
        // Find which completed sessions don't have reviews yet
        const reviewedSessionIds = new Set(reviews.map(review => review.session._id))
        const pendingSessions = completedSessions.filter(
          session => !reviewedSessionIds.has(session._id)
        )
        
        setPendingReviews(pendingSessions)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Filter reviews based on status
  const filteredReviews = filter === "all" 
    ? [...reviews, ...pendingReviews.map(session => ({ 
        _id: session._id,
        tutor: session.tutor,
        status: "pending" 
      }))]
    : filter === "completed" 
      ? reviews 
      : pendingReviews.map(session => ({ 
          _id: session._id,
          tutor: session.tutor,
          status: "pending" 
        }))

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star key={index} className={`w-4 h-4 ${index < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
      ))
  }

  const renderReviewCard = (review) => {
    if (review.status === "pending") {
      // Extract information from pendingReviews
      const pendingSession = pendingReviews.find((session) => session._id === review._id);
  
      return (
        <div key={review._id} className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center mb-4">
            <img
              src={pendingSession?.tutor?.profileImage || "/placeholder.svg"}
              alt={pendingSession?.tutor?.name || "Tutor"}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{pendingSession?.tutor?.name || "Tutor"}</h3>
              <p className="text-sm text-gray-500">{pendingSession?.tutor?.expertise?.[0] || "Tutor"}</p>
            </div>
          </div>
  
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 mb-4">You haven't reviewed this tutor yet.</p>
            <Link
              to={`/student/review/${pendingSession?._id}`}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Write a Review
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div key={review._id} className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src={(review.tutor?.profileImage) || "/placeholder.svg"}
              alt={(review.tutor?.name) || "Tutor"}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{(review.tutor?.name) || "Tutor"}</h3>
              <p className="text-sm text-gray-500">{review.session?.subject || "Session"}</p>
            </div>
          </div>
          <div className="flex items-center">{renderStars(review.rating)}</div>
        </div>

        <p className="text-gray-700 mb-4">{review.comment}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Reviews</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            filter === "all"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setFilter("all")}
        >
          All Reviews
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            filter === "completed"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            filter === "pending"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
      </div>

      {/* Reviews */}
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg">
          {error}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => renderReviewCard(review))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No reviews found</h3>
          <p className="text-gray-500 mb-6">You haven't written any reviews yet.</p>
        </div>
      )}
    </div>
  )
}

export default Reviews