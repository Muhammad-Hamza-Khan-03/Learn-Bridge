import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Search, Filter, ChevronDown, X, Users } from "lucide-react"
import StudentCard from "../../components/page-components/StatsCard"
import { setLoading, setStudents, setError } from "../../redux/slices/UserSlice"

const TutorSearch = () => {
  const dispatch = useDispatch()
  const { students = [], isLoading, error } = useSelector((state) => state.users)
  const [searchParams, setSearchParams] = useState({
    subject: "",
    learningGoal: "",
    grade: "",
    country: "",
    search: "",
  })
  const [filteredStudents, setFilteredStudents] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch all students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        dispatch(setLoading())
  
        // Changed from /api/students to the correct endpoint
        const response = await fetch("http://localhost:5000/api/users/students/search", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }
  
        const data = await response.json()
        dispatch(setStudents(data.data)) // Note the .data property
      } catch (error) {
        dispatch(setError(error.message))
      }
    }
  
    fetchStudents()
  }, [dispatch])
  // Update filtered students whenever students or search params change
  useEffect(() => {
    if (students && students.length > 0) {
      applyFilters()
    } else {
      setFilteredStudents([])
    }
  }, [students, searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSearchParams({
      ...searchParams,
      [name]: value,
    })
  }

  const applyFilters = () => {
    if (!students || !Array.isArray(students)) {
      setFilteredStudents([])
      return
    }

    let filtered = [...students]

    // Filter by search term
    if (searchParams.search) {
      const searchTerm = searchParams.search.toLowerCase()
      filtered = filtered.filter(
        (student) =>
          (student.name && student.name.toLowerCase().includes(searchTerm)) ||
          (student.bio && student.bio.toLowerCase().includes(searchTerm)),
      )
    }

    // Filter by subject
    if (searchParams.subject) {
      filtered = filtered.filter(
        (student) =>
          student.preferredSubjects &&
          student.preferredSubjects.some((subject) =>
            subject.toLowerCase().includes(searchParams.subject.toLowerCase()),
          ),
      )
    }

    // Filter by learning goal
    if (searchParams.learningGoal) {
      filtered = filtered.filter(
        (student) =>
          student.learningGoals &&
          student.learningGoals.some((goal) => goal.toLowerCase().includes(searchParams.learningGoal.toLowerCase())),
      )
    }

    // Filter by grade/level
    if (searchParams.grade) {
      filtered = filtered.filter((student) => student.grade === searchParams.grade)
    }

    // Filter by country
    if (searchParams.country) {
      filtered = filtered.filter(
        (student) => student.country && student.country.toLowerCase().includes(searchParams.country.toLowerCase()),
      )
    }

    setFilteredStudents(filtered)
  }

  const resetSearch = () => {
    setSearchParams({
      subject: "",
      learningGoal: "",
      grade: "",
      country: "",
      search: "",
    })
  }

  // Get unique subjects and learning goals from students for filter dropdowns
  const uniqueSubjects =
    students && students.length > 0 ? [...new Set(students.flatMap((student) => student.preferredSubjects || []))] : []

  const uniqueLearningGoals =
    students && students.length > 0 ? [...new Set(students.flatMap((student) => student.learningGoals || []))] : []

  const uniqueCountries =
    students && students.length > 0
      ? [...new Set(students.filter((student) => student.country).map((student) => student.country))]
      : []

      // todo:its not being used in jsx
      const searchStudentsWithFilters = async (filters) => {
        try {
          dispatch(setLoading())
      
          // Create query string from filters
          const queryParams = new URLSearchParams()
          if (filters.subject) queryParams.append("subject", filters.subject)
          if (filters.learningGoal) queryParams.append("learningGoal", filters.learningGoal)
          if (filters.grade) queryParams.append("grade", filters.grade)
          if (filters.country) queryParams.append("country", filters.country)
          if (filters.search) queryParams.append("search", filters.search)
      
          // Changed from /api/students to the correct endpoint
          const response = await fetch(`/api/users/students/search?${queryParams.toString()}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
      
          if (!response.ok) {
            throw new Error("Failed to search students")
          }
      
          const data = await response.json()
          dispatch(setStudents(data.data)) // Note the .data property
        } catch (error) {
          dispatch(setError(error.message))
        }
      }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Find Students</h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students by name or bio..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              name="search"
              value={searchParams.search}
              onChange={handleChange}
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                value={searchParams.subject}
                onChange={handleChange}
              >
                <option value="">Any Subject</option>
                {uniqueSubjects.map((subject, idx) => (
                  <option key={idx} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="learningGoal" className="block text-sm font-medium text-gray-700 mb-1">
                Learning Goal
              </label>
              <select
                id="learningGoal"
                name="learningGoal"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                value={searchParams.learningGoal}
                onChange={handleChange}
              >
                <option value="">Any Learning Goal</option>
                {uniqueLearningGoals.map((goal, idx) => (
                  <option key={idx} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade/Level
              </label>
              <select
                id="grade"
                name="grade"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                value={searchParams.grade}
                onChange={handleChange}
              >
                <option value="">Any Level</option>
                <option value="Elementary">Elementary</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
                <option value="Graduate">Graduate</option>
                <option value="Adult Learning">Adult Learning</option>
              </select>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="country"
                name="country"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                value={searchParams.country}
                onChange={handleChange}
              >
                <option value="">Any Country</option>
                {uniqueCountries.map((country, idx) => (
                  <option key={idx} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={resetSearch}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 font-poppins">
            {isLoading ? "Searching..." : `${filteredStudents.length} Students Found`}
          </h2>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg mb-6">
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

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : !students || students.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No students found</h3>
            <p className="text-gray-500 mb-6">
              This might be because the student search feature is not yet implemented on the backend.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No students match your criteria</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters to find students.</p>
            <button
              className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
              onClick={resetSearch}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <StudentCard key={student._id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TutorSearch
