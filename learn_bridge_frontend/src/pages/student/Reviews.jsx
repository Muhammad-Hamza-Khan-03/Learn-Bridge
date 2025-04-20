"use client"

import { useState } from "react"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"

const Reviews = () => {
  const [filter, setFilter] = useState("all")

  // Sample reviews data
  const reviews = [
    {
      id: 1,
      tutor: {
        name: "Dr. Sarah Williams",
        subject: "Mathematics",
        image: "/placeholder.svg?height=50&width=50",
      },
      rating: 5,
      date: "2025-04-10",
      content:
        "Dr. Williams is an exceptional tutor. She explained complex calculus concepts in a way that was easy to understand. Her patience and knowledge made a huge difference in my understanding of the subject.",
      helpful: 24,
      replies: 2,
      status: "completed",
    },
    {
      id: 2,
      tutor: {
        name: "Prof. Michael Chen",
        subject: "Physics",
        image: "/placeholder.svg?height=50&width=50",
      },
      rating: 4,
      date: "2025-04-05",
      content:
        "Prof. Chen has a deep understanding of physics and communicates complex ideas clearly. The only reason I'm not giving 5 stars is that sometimes the sessions ran a bit over time.",
      helpful: 18,
      replies: 1,
      status: "completed",
    },
    {
      id: 3,
      tutor: {
        name: "Dr. Emily Johnson",
        subject: "English Literature",
        image: "/placeholder.svg?height=50&width=50",
      },
      rating: 5,
      date: "2025-03-28",
      content:
        "Dr. Johnson's insights into literary analysis have transformed my approach to reading and writing. Her feedback on my essays was detailed and constructive. Highly recommend!",
      helpful: 32,
      replies: 3,
      status: "completed",
    },
    {
      id: 4,
      tutor: {
        name: "Dr. Robert Lee",
        subject: "Chemistry",
        image: "/placeholder.svg?height=50&width=50",
      },
      status: "pending",
    },
  ]

  // Filter reviews based on status
  const filteredReviews = filter === "all" ? reviews : reviews.filter((review) => review.status === filter)

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star key={index} className={`w-4 h-4 ${index < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
      ))
  }

  const renderReviewCard = (review) => {
    if (review.status === "pending") {
      return (
        <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center mb-4">
            <img
              src={review.tutor.image || "/placeholder.svg"}
              alt={review.tutor.name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{review.tutor.name}</h3>
              <p className="text-sm text-gray-500">{review.tutor.subject}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 mb-4">You haven't reviewed this tutor yet.</p>
            <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Write a Review
            </button>
          </div>
        </div>
      )
    }

    return (
      <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src={review.tutor.image || "/placeholder.svg"}
              alt={review.tutor.name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{review.tutor.name}</h3>
              <p className="text-sm text-gray-500">{review.tutor.subject}</p>
            </div>
          </div>
          <div className="flex items-center">{renderStars(review.rating)}</div>
        </div>

        <p className="text-gray-700 mb-4">{review.content}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {new Date(review.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <div className="flex items-center space-x-4">
            <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>Helpful ({review.helpful})</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>Reply ({review.replies})</span>
            </button>
          </div>
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
      <div className="space-y-4">{filteredReviews.map((review) => renderReviewCard(review))}</div>
    </div>
  )
}

export default Reviews
