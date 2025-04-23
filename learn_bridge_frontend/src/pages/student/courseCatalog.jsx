import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { SearchIcon, Star, Clock, BookOpen, X } from "lucide-react"
import { setCourses, setLoading, setError } from "../../redux/slices/courseSlice"
import CourseCard from "../../components/page-components/CourseCard"

const BASE_URL = "http://localhost:5000/api"

const CourseCatalog = () => {
  const dispatch = useDispatch()
  const { courses, isLoading, error } = useSelector((state) => state.courses)
  const [filters, setFilters] = useState({
    subject: "",
    level: "",
    search: "",
  })


  useEffect(() => {
    const fetchCourses = async () => {
      dispatch(setLoading())
      try {
        console.log("Fetching courses from API")
        // Replace mock API call with direct fetch to backend
        const response = await fetch(`${BASE_URL}/courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch courses")
        }
  
        const data = await response.json()
        dispatch(setCourses(data.data || []))
      } catch (error) {
        console.error("Error fetching courses:", error)
        dispatch(setError(error.message || "An error occurred while fetching courses"))
      }
    }
  
    fetchCourses()
  }, [dispatch])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const filteredCourses = courses.filter((course) => {
    return (
      (filters.subject === "" || course.subject.toLowerCase().includes(filters.subject.toLowerCase())) &&
      (filters.level === "" || course.level === filters.level) &&
      (filters.search === "" ||
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.subject.toLowerCase().includes(filters.search.toLowerCase()))
    )
  })

  // Get unique subjects for filter dropdown
  const subjects = courses && courses.length > 0 ? [...new Set(courses.map((course) => course.subject))] : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Course Catalog</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for courses..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <select
          className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          name="subject"
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
        <select
          className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          name="level"
          value={filters.level}
          onChange={handleFilterChange}
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <button
          className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => setFilters({ subject: "", level: "", search: "" })}
        >
          <X size={20} className="mr-2 text-gray-600" />
          <span className="font-medium text-gray-700">Reset</span>
        </button>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 mr-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Courses</p>
            <p className="text-xl font-bold text-gray-800">{courses.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 mr-4">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Top Rated</p>
            <p className="text-xl font-bold text-gray-800">
              {courses.filter((course) => course.tutor?.averageRating >= 4.5).length} Courses
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <div className="p-3 rounded-lg bg-amber-100 text-amber-600 mr-4">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Starting Soon</p>
            <p className="text-xl font-bold text-gray-800">
              {
                courses.filter((course) => {
                  const startDate = new Date(course.startDate)
                  const now = new Date()
                  const diffTime = Math.abs(startDate - now)
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  return diffDays <= 7
                }).length
              }{" "}
              Courses
            </p>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={{
                id: course._id,
                title: course.title,
                description: course.description,
                tutor: {
                  name: course.tutor?.name || "Instructor",
                  credentials: course.tutor?.education || "",
                  image: "/placeholder.svg?height=50&width=50",
                },
                rating: course.tutor?.averageRating || 0,
                reviews: course.tutor?.totalReviews || 0,
                duration: `${course.duration} weeks`,
                level: course.level,
                students: course.enrolledStudents?.length || 0,
                price: course.price || 0,
                tags: [course.subject, course.level],
                availableSpots: course.maxStudents - (course.enrolledStudents?.length || 0),
                enrolled: course.enrolledStudents?.includes(course.user?._id),
              }}
              linkTo={`/student/course/${course._id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            onClick={() => setFilters({ subject: "", level: "", search: "" })}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default CourseCatalog
