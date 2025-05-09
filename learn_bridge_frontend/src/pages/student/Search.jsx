import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, X, BookOpen, Star, MapPin, Clock, Award } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"

import { setTutors, setLoading, setError } from "../../redux/slices/UserSlice"

const BASE_URL = "http://localhost:5000/api"
const Search = () => {
  const dispatch = useDispatch()
  const { tutors, isLoading, error } = useSelector((state) => state.users)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTutors, setFilteredTutors] = useState([])

  // Fetch tutors on component mount
  useEffect(() => {
    const fetchTutors = async () => {
      dispatch(setLoading())
      try {
        console.log("Fetching tutors from API")
        
        const response = await fetch(`${BASE_URL}/users/tutors/search`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
  
        if (!response.ok) {
          throw new Error("Failed to fetch tutors")
        }
  
        const data = await response.json()
        dispatch(setTutors(data.data || []))
      } catch (error) {
        console.error("Error fetching tutors:", error)
        dispatch(setError(error.message || "An error occurred while fetching tutors"))
      }
    }
  
    fetchTutors()
  }, [dispatch])

  // Update filtered tutors whenever tutors or search term changes
  useEffect(() => {
    if (tutors && tutors.length > 0) {
      applySearch()
    }
  }, [tutors, searchTerm])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const applySearch = () => {
    if (!tutors || !Array.isArray(tutors)) {
      setFilteredTutors([])
      return
    }

    if (!searchTerm.trim()) {
      setFilteredTutors([...tutors])
      return
    }

    const term = searchTerm.toLowerCase().trim()
    
    const filtered = tutors.filter(tutor => {
      // Search in name and bio
      if ((tutor.name && tutor.name.toLowerCase().includes(term)) ||
          (tutor.bio && tutor.bio.toLowerCase().includes(term))) {
        return true
      }
      
      // Search in expertise (subjects)
      if (tutor.expertise && 
          tutor.expertise.some(exp => exp.toLowerCase().includes(term))) {
        return true
      }

      // Search in country
      if (tutor.country && tutor.country.toLowerCase().includes(term)) {
        return true
      }

      // Search in rating (if term is a number between 1-5)
      const ratingMatch = /^[1-5](\.\d)?$/.test(term);
      if (ratingMatch && tutor.averageRating >= parseFloat(term)) {
        return true
      }

      // Search in availability (day of week)
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      if (days.includes(term) && tutor.availability && 
          tutor.availability.some(slot => slot.day.toLowerCase() === term)) {
        return true
      }

      // Search in education
      if (tutor.education && tutor.education.toLowerCase().includes(term)) {
        return true
      }

      // Search in hourly rate (if term includes $ or number)
      if (tutor.hourlyRate && 
          (term.includes("$") || !isNaN(parseFloat(term))) && 
          tutor.hourlyRate.toString().includes(term.replace("$", ""))) {
        return true
      }

      return false
    })

    setFilteredTutors(filtered)
  }

  const resetSearch = () => {
    setSearchTerm("")
    setFilteredTutors(tutors)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating || 0) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Find Tutors</h1>
      </div>

      {/* Unified Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search as you like(days, subjects, names etc.)"
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {isLoading ? "Searching..." : `${filteredTutors.length} Results`}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : filteredTutors.length > 0 ? (
          <div className="space-y-6">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor._id}
                className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-3/4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{tutor.name}</h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {tutor.expertise &&
                        tutor.expertise.map((subject, index) => (
                          <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                            {subject}
                          </span>
                        ))}
                      {tutor.country && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {tutor.country}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{tutor.bio}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {tutor.experience && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="w-4 h-4 mr-2 text-indigo-600" />
                          <span>
                            <strong>Experience:</strong> {tutor.experience} years
                          </span>
                        </div>
                      )}
                      {tutor.education && (
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                          <span>
                            <strong>Education:</strong> {tutor.education}
                          </span>
                        </div>
                      )}
                      {tutor.hourlyRate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                          <span>
                            <strong>Rate:</strong> ${tutor.hourlyRate}/hour
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:w-1/4 flex flex-col items-center justify-center">
                    <div className="mb-4 text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-1">
                        {tutor.averageRating ? tutor.averageRating.toFixed(1) : "N/A"}
                        <span className="text-sm text-gray-500"> / 5</span>
                      </div>
                      <div className="mb-1">{renderStars(tutor.averageRating)}</div>
                      <div className="text-xs text-gray-500">{tutor.totalReviews || 0} reviews</div>
                    </div>

                    <div className="space-y-2 w-full">
                     
                      <Link
                        to={`/student/schedule/${tutor._id}`}
                        className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Schedule Session
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No tutors found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search to find what you're looking for.</p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              onClick={resetSearch}
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search