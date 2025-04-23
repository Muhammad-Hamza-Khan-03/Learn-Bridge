import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Search, Filter, ChevronDown, X, Plus, BookOpen } from "lucide-react"
import CourseCard from "../../components/page-components/CourseCard"
import { setLoading, setError, setTutorCourses, addCourse, removeCourse } from "../../redux/slices/courseSlice"

const TutorCatalog = () => {
  const dispatch = useDispatch()
  const { tutorCourses, isLoading, error, success } = useSelector((state) => state.courses)
  const { user } = useSelector((state) => state.auth)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    level: "Beginner",
    duration: 4,
    maxStudents: 20,
    startDate: "",
    endDate: "",
    timings: [{ day: "Monday", startTime: "09:00", endTime: "10:00" }],
    courseImage: "",
  })
  const [filters, setFilters] = useState({
    subject: "",
    level: "",
    status: "",
    search: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

 // Fixed course fetching in tutorCatalog.jsx
useEffect(() => {
  const fetchCourses = async () => {
    try {
      dispatch(setLoading())

      // Update to the correct endpoint
      const response = await fetch("http://localhost:5000/api/courses/tutor/mycourses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()
      
      // Process and enrich course data before dispatching
      const enrichedCourses = data.data.map(course => {
        // Add mock tutor information if needed
        return {
          ...course,
          tutor: {
            name: user?.name || "Instructor",
            credentials: course.subject ? `${course.subject} Instructor` : "Tutor",
            image: null
          },
          // Add other properties needed by CourseCard component
          duration: course.duration ? `${course.duration} weeks` : "TBD",
          students: course.enrolledStudents?.length || 0,
          tags: course.subject ? [course.subject, course.level || "Beginner"] : [],
          rating: course.averageRating || 4.5,
          reviews: course.totalReviews || 0,
          // Use _id as id if needed
          id: course._id
        }
      });
      
      dispatch(setTutorCourses(enrichedCourses)) // Dispatch the enriched courses
    } catch (error) {
      dispatch(setError(error.message))
    }
  }

  fetchCourses()
}, [dispatch, user?.name])

  useEffect(() => {
    if (success) {
      setShowCreateForm(false)
      setFormData({
        title: "",
        description: "",
        subject: "",
        level: "Beginner",
        duration: 4,
        maxStudents: 20,
        startDate: "",
        endDate: "",
        timings: [{ day: "Monday", startTime: "09:00", endTime: "10:00" }],
      })
    }
  }, [success])

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          courseImage: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTimingChange = (index, field, value) => {
    const updatedTimings = [...formData.timings]
    updatedTimings[index] = {
      ...updatedTimings[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      timings: updatedTimings,
    })
  }

  const addTiming = () => {
    setFormData({
      ...formData,
      timings: [...formData.timings, { day: "Monday", startTime: "09:00", endTime: "10:00" }],
    })
  }

  const removeTiming = (index) => {
    const updatedTimings = [...formData.timings]
    updatedTimings.splice(index, 1)
    setFormData({
      ...formData,
      timings: updatedTimings,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    try {
      dispatch(setLoading())
  
      const response = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })
  
      if (!response.ok) {
        throw new Error("Failed to create course")
      }
  
      const newCourse = await response.json()
      dispatch(addCourse(newCourse.data)) // Note the .data property
    } catch (error) {
      dispatch(setError(error.message))
    }
  }
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const resetFilters = () => {
    setFilters({
      subject: "",
      level: "",
      status: "",
      search: "",
    })
  }

  const filteredCourses = tutorCourses.filter((course) => {
    // Filter by tab
    if (activeTab === "active" && !course.isActive) return false
    if (activeTab === "inactive" && course.isActive) return false

    // Filter by other criteria
    return (
      (filters.subject === "" ||
        (course.subject && course.subject.toLowerCase().includes(filters.subject.toLowerCase()))) &&
      (filters.level === "" || course.level === filters.level) &&
      (filters.status === "" ||
        (filters.status === "active" && course.isActive) ||
        (filters.status === "inactive" && !course.isActive)) &&
      (filters.search === "" ||
        (course.title && course.title.toLowerCase().includes(filters.search.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (course.subject && course.subject.toLowerCase().includes(filters.search.toLowerCase())))
    )
  })

  // Get unique subjects for filter dropdown
  const subjects = tutorCourses
    .filter((course) => course && course.subject)
    .map((course) => course.subject)
    .filter((subject, index, self) => self.indexOf(subject) === index)

  const handleEditCourse = (courseId) => {
    console.log(`Edit course ${courseId}`)
    // Navigate to edit page
    // This doesn't need to be changed as it's just navigation
  }

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete course")
      }

      dispatch(removeCourse(courseId))
    } catch (error) {
      dispatch(setError(error.message))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Course Management</h1>
        <button
          className="inline-flex items-center px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? (
            <>
              <X className="w-5 h-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Create New Course
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-rose-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 font-poppins">Create New Course</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="mb-6">
  <label htmlFor="courseImage" className="block text-sm font-medium text-gray-700 mb-1">
    Course Image
  </label>
  <input
    type="file"
    id="courseImage"
    name="courseImage"
    accept="image/*"
    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
    onChange={handleFileChange}
  />
  {formData.courseImage && (
    <div className="mt-2">
      <img src={formData.courseImage} alt="Course preview" className="w-full max-h-40 object-cover rounded-lg" />
    </div>
  )}
</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div>
                <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Students
                </label>
                <input
                  type="number"
                  id="maxStudents"
                  name="maxStudents"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Course Timings</label>
                <button
                  type="button"
                  className="text-sm text-[#3B82F6] hover:text-opacity-80 transition-colors flex items-center"
                  onClick={addTiming}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Timing
                </button>
              </div>
              <div className="space-y-3">
                {formData.timings.map((timing, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-full md:w-auto md:flex-1">
                      <select
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        value={timing.day}
                        onChange={(e) => handleTimingChange(index, "day", e.target.value)}
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div className="w-full md:w-auto md:flex-1">
                      <input
                        type="time"
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        value={timing.startTime}
                        onChange={(e) => handleTimingChange(index, "startTime", e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-auto md:flex-1">
                      <input
                        type="time"
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        value={timing.endTime}
                        onChange={(e) => handleTimingChange(index, "endTime", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="p-2 text-rose-500 hover:text-rose-700 transition-colors"
                      onClick={() => removeTiming(index)}
                      disabled={formData.timings.length === 1}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
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
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "all" ? "border-b-2 border-[#3B82F6] text-[#3B82F6]" : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Courses
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active Courses
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "inactive"
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("inactive")}
          >
            Inactive Courses
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
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
                <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject-filter"
                  name="subject"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  placeholder="Filter by subject..."
                />
              </div>
              <div>
                <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  id="level-filter"
                  name="level"
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  value={filters.level}
                  onChange={handleFilterChange}
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
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

        {/* Course Grid */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} onEdit={handleEditCourse} onDelete={handleDeleteCourse} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">
                {!tutorCourses.length
                  ? "You haven't created any courses yet."
                  : "Try adjusting your filters to find what you're looking for."}
              </p>
              <button
                className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                onClick={() => {
                  if (!tutorCourses.length) {
                    setShowCreateForm(true)
                  } else {
                    resetFilters()
                  }
                }}
              >
                {!tutorCourses.length ? "Create Your First Course" : "Reset Filters"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TutorCatalog
