import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Search, X, Users } from "lucide-react"
import StudentCard from "../../components/page-components/studentCard.jsx"
import { setLoading, setStudents, setError } from "../../redux/slices/UserSlice"

const TutorSearch = () => {
  const dispatch = useDispatch()
  const { students = [], isLoading, error } = useSelector((state) => state.users)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState([])

  // Fetch all students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        dispatch(setLoading())
  
        const response = await fetch("http://localhost:5000/api/users/students/search", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }
  
        const data = await response.json()
        dispatch(setStudents(data.data)) 
      } catch (error) {
        dispatch(setError(error.message))
      }
    }
  
    fetchStudents()
  }, [dispatch])

  // Update filtered students whenever students or search term changes
  useEffect(() => {
    if (students && students.length > 0) {
      applySearch()
    } else {
      setFilteredStudents([])
    }
  }, [students, searchTerm])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const applySearch = () => {
    if (!students || !Array.isArray(students)) {
      setFilteredStudents([])
      return
    }

    if (!searchTerm.trim()) {
      setFilteredStudents([...students])
      return
    }

    const term = searchTerm.toLowerCase().trim()
    
    const filtered = students.filter(student => {
      // Search in name and bio
      if ((student.name && student.name.toLowerCase().includes(term)) ||
          (student.bio && student.bio.toLowerCase().includes(term))) {
        return true
      }
      
      // Search in subjects
      if (student.preferredSubjects && 
          student.preferredSubjects.some(subject => subject.toLowerCase().includes(term))) {
        return true
      }

      // Search in learning goals
      if (student.learningGoals && 
          student.learningGoals.some(goal => goal.toLowerCase().includes(term))) {
        return true
      }

      // Search in grade/level
      if (student.grade && student.grade.toLowerCase().includes(term)) {
        return true
      }

      // Search in country
      if (student.country && student.country.toLowerCase().includes(term)) {
        return true
      }

      return false
    })

    setFilteredStudents(filtered)
  }

  const resetSearch = () => {
    setSearchTerm("")
    setFilteredStudents(students)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Find Students</h1>
      </div>

      {/* Unified Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students as you like"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={resetSearch}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
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
            <h3 className="text-lg font-medium text-gray-800 mb-2">No students match your search</h3>
            <p className="text-gray-500 mb-6">Try different search terms to find students.</p>
            <button
              className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
              onClick={resetSearch}
            >
              Reset Search
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