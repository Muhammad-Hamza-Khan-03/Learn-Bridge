import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { ChevronLeft, Star } from "lucide-react"
import { setCurrentSession, setLoading, setError } from "../../redux/slices/SessionSlice"

const BASE_URL = "https://api.example.com"

// API endpoints
export const API_URLS = {
  AUTH: `${BASE_URL}/auth`,
  USERS: `${BASE_URL}/users`,
  SESSIONS: `${BASE_URL}/sessions`,
  COURSES: `${BASE_URL}/courses`,
}

const SessionReview = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentSession, isLoading, error } = useSelector((state) => state.sessions)
  const { user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [existingReview, setExistingReview] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      dispatch(setLoading())
      try {
        const response = await fetch(`${API_URLS.SESSIONS}/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch session")
        }

        const data = await response.json()
        dispatch(setCurrentSession(data.data))
      } catch (error) {
        dispatch(setError(error.message))
      }
    }

    fetchSession()
  }, [dispatch, sessionId])

  useEffect(() => {
    // Check if a review already exists
    const checkExistingReview = async () => {
      try {
        if (currentSession && currentSession.tutor) {
          const response = await fetch(`${API_URLS.USERS}/reviews/check/${sessionId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })

          if (!response.ok) {
            return // No review exists
          }

          const data = await response.json()
          if (data.data) {
            setExistingReview(data.data)
            setFormData({
              rating: data.data.rating,
              comment: data.data.comment || "",
            })
          }
        }
      } catch (err) {
        // If no review exists or any other error, just continue
        console.log("No existing review found or error checking")
      }
    }

    if (currentSession) {
      checkExistingReview()
    }
  }, [currentSession, sessionId])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRatingChange = (newRating) => {
    setFormData({
      ...formData,
      rating: newRating,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLocalError(null)

    try {
      const reviewData = {
        session: sessionId,
        tutor: currentSession.tutor._id,
        rating: formData.rating,
        comment: formData.comment,
      }

      let response

      if (existingReview) {
        // Update existing review
        response = await fetch(`${API_URLS.USERS}/reviews/${existingReview._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(reviewData),
        })
      } else {
        // Create new review
        response = await fetch(`${API_URLS.USERS}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(reviewData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      setSuccess(true)
      setTimeout(() => {
        navigate("/meetings")
      }, 2000)
    } catch (err) {
      setLocalError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-rose-50 text-rose-600 p-4 rounded-lg">
        {error}
        <button
          className="ml-4 bg-rose-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="bg-amber-50 text-amber-600 p-4 rounded-lg">
        Session not found.
        <button
          className="ml-4 bg-amber-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    )
  }

  // Only students can leave reviews
  if (user.role !== "student") {
    return (
      <div className="bg-amber-50 text-amber-600 p-4 rounded-lg">
        Only students can leave reviews.
        <button
          className="ml-4 bg-amber-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    )
  }

  // Only completed sessions can be reviewed
  if (currentSession.status !== "completed") {
    return (
      <div className="bg-amber-50 text-amber-600 p-4 rounded-lg">
        Only completed sessions can be reviewed.
        <button
          className="ml-4 bg-amber-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
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
        <h1 className="text-2xl font-bold text-gray-800 ml-4">
          {existingReview ? "Edit Your Review" : "Leave a Review"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {success ? (
          <div className="bg-emerald-50 text-emerald-600 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Thank you for your review!</h3>
            <p className="mb-4">Your feedback helps other students find great tutors.</p>
            <p className="text-sm">Redirecting you back to your sessions...</p>
          </div>
        ) : (
          <>
            {localError && <div className="bg-rose-50 text-rose-600 p-4 rounded-lg mb-6">{localError}</div>}

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">
                    <strong>Subject:</strong> {currentSession.subject}
                  </p>
                  <p className="text-gray-700">
                    <strong>Date:</strong> {new Date(currentSession.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Time:</strong> {currentSession.startTime} - {currentSession.endTime}
                  </p>
                  <p className="text-gray-700">
                    <strong>Status:</strong>{" "}
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= formData.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="5"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Share your experience with this tutor..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : existingReview ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default SessionReview
