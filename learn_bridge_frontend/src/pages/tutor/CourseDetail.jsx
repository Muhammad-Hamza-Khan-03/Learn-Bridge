"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  ChevronLeft,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Edit,
  Trash2,
  User,
  MessageSquare,
  AlertCircle,
  Plus,
} from "lucide-react"

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)

        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch course details")
        }

        const data = await response.json()
        setCourse(data)

        // Fetch enrolled students if there are any
        if (data.enrolledStudents && data.enrolledStudents.length > 0) {
          const studentsResponse = await fetch(`/api/courses/${courseId}/students`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })

          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json()
            setEnrolledStudents(studentsData)
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err)
        setError(err.message || "Failed to load course details")
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const handleDeleteCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      navigate("/tutor/catalog")
    } catch (err) {
      setError(err.message || "Failed to delete course")
    } finally {
      setShowDeleteModal(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isActive: !course.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update course status")
      }

      const updatedCourse = await response.json()
      setCourse(updatedCourse)
    } catch (err) {
      setError(err.message || "Failed to update course status")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-800 mb-2">Course not found</h2>
        <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate("/tutor/catalog")}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
        >
          Back to Courses
        </button>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
        <h1 className="text-2xl font-bold text-gray-800 ml-4 font-poppins">Course Details</h1>
      </div>

      <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Course header with gradient background */}
        <div className="h-32 bg-gradient-to-r from-[#3B82F6] to-[#6366F1] p-6 flex items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{course.title}</h2>
            <p className="text-white text-opacity-90 mt-1">
              {course.subject} - {course.level}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/tutor/course/${course._id}/edit`)}
              className="p-2 bg-white text-[#3B82F6] rounded-lg hover:bg-opacity-90 transition-colors"
              aria-label="Edit course"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 bg-white text-rose-500 rounded-lg hover:bg-opacity-90 transition-colors"
              aria-label="Delete course"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
              course.isActive ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${course.isActive ? "bg-emerald-500" : "bg-gray-500"}`}></span>
            {course.isActive ? "Active" : "Inactive"}
          </button>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Course Details
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "students"
                  ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("students")}
            >
              Enrolled Students
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[#3B82F6] bg-opacity-10 text-[#3B82F6]">
                {course.enrolledStudents?.length || 0}
              </span>
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "materials"
                  ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("materials")}
            >
              Course Materials
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "details" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                  <Calendar className="w-8 h-8 text-[#3B82F6] mb-2" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Course Duration</h3>
                  <p className="text-gray-600">{course.duration} weeks</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                  <Users className="w-8 h-8 text-[#3B82F6] mb-2" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Enrollment</h3>
                  <p className="text-gray-600">
                    {course.enrolledStudents?.length || 0}/{course.maxStudents} students
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                  <Clock className="w-8 h-8 text-[#3B82F6] mb-2" />
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Course Dates</h3>
                  <p className="text-gray-600 text-center">
                    {formatDate(course.startDate)} - {formatDate(course.endDate)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {course.timings && course.timings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {course.timings.map((timing, index) => (
                        <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg bg-white">
                          <div className="p-2 bg-[#3B82F6] bg-opacity-10 rounded-full mr-3">
                            <Clock className="w-5 h-5 text-[#3B82F6]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{timing.day}</p>
                            <p className="text-sm text-gray-600">
                              {timing.startTime} - {timing.endTime}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No scheduled timings available.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Enrolled Students</h3>
                <div className="text-sm text-gray-600">
                  {course.enrolledStudents?.length || 0} of {course.maxStudents} spots filled
                </div>
              </div>

              {enrolledStudents.length > 0 ? (
                <div className="space-y-4">
                  {enrolledStudents.map((student) => (
                    <div
                      key={student._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white mr-4">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-600 hover:text-[#3B82F6] transition-colors"
                          title="Send message"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-[#10B981] transition-colors"
                          title="Schedule session"
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No students enrolled yet</h3>
                  <p className="text-gray-500 mb-4">Students will appear here once they enroll in your course.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Course Materials</h3>
                <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </button>
              </div>

              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No materials added yet</h3>
                <p className="text-gray-500 mb-4">
                  Add lecture notes, assignments, and other learning materials for your students.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Course</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this course? This action cannot be undone. All data associated
                        with this course will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-rose-600 text-base font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteCourse}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
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

export default CourseDetail
