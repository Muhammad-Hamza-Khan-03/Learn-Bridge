import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { SearchIcon, Filter, BookOpen, X, Star, MapPin, Clock, Award } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { mockApi } from "../../mock/mockApi"
import { setTutors, setLoading, setError } from "../../redux/slices/UserSlice"

const Search = () => {
  const dispatch = useDispatch()
  const { tutors, isLoading, error } = useSelector((state) => state.users)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams, setSearchParams] = useState({
    subject: "",
    country: "",
    rating: "",
    availability: {
      day: "",
      time: "",
    },
  })
  const [filteredTutors, setFilteredTutors] = useState([])

  // Fetch tutors on component mount
  useEffect(() => {
    const fetchTutors = async () => {
      dispatch(setLoading())
      try {
        console.log("Fetching tutors from mock API")
        const data = await mockApi.users.getTutors()
        dispatch(setTutors(data.data || []))
      } catch (error) {
        console.error("Error fetching tutors:", error)
        dispatch(setError(error.message || "An error occurred while fetching tutors"))
      }
    }

    fetchTutors()
  }, [dispatch])

  // Update filtered tutors whenever tutors or search params change
  useEffect(() => {
    if (tutors && tutors.length > 0) {
      applyFilters()
    }
  }, [tutors, searchParams, searchTerm])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setSearchParams({
        ...searchParams,
        [parent]: {
          ...searchParams[parent],
          [child]: value,
        },
      })
    } else {
      setSearchParams({
        ...searchParams,
        [name]: value,
      })
    }
  }

  const applyFilters = () => {
    let filtered = [...tutors]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tutor.expertise && tutor.expertise.some((exp) => exp.toLowerCase().includes(searchTerm.toLowerCase()))) ||
          tutor.bio?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by subject
    if (searchParams.subject) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.expertise &&
          tutor.expertise.some((exp) => exp.toLowerCase().includes(searchParams.subject.toLowerCase())),
      )
    }

    // Filter by country
    if (searchParams.country) {
      filtered = filtered.filter((tutor) => tutor.country?.toLowerCase().includes(searchParams.country.toLowerCase()))
    }

    // Filter by rating
    if (searchParams.rating) {
      const minRating = Number.parseFloat(searchParams.rating)
      filtered = filtered.filter((tutor) => tutor.averageRating >= minRating)
    }

    // Filter by availability
    if (searchParams.availability.day && searchParams.availability.time) {
      filtered = filtered.filter((tutor) => {
        if (!tutor.availability) return false

        return tutor.availability.some((slot) => {
          if (searchParams.availability.day && slot.day !== searchParams.availability.day) {
            return false
          }

          if (searchParams.availability.time) {
            const [requestedStart, requestedEnd] = searchParams.availability.time.split("-")
            if (slot.startTime > requestedStart || slot.endTime < requestedEnd) {
              return false
            }
          }

          return true
        })
      })
    }

    setFilteredTutors(filtered)
  }

  const resetFilters = () => {
    setSearchParams({
      subject: "",
      country: "",
      rating: "",
      availability: {
        day: "",
        time: "",
      },
    })
    setSearchTerm("")
  }

  // Days of the week for availability filter
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Time slots for availability filter
  const timeSlots = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"]

  // Get unique subjects from tutors for filter dropdown
  const uniqueSubjects =
    tutors && tutors.length > 0 ? [...new Set(tutors.flatMap((tutor) => tutor.expertise || []))] : []

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

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for tutors, subjects, or keywords..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} className="mr-2 text-gray-600" />
          <span className="font-medium text-gray-700">Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors" onClick={resetFilters}>
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Subject Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Subject</h3>
              <select
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                name="subject"
                value={searchParams.subject}
                onChange={handleChange}
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map((subject, idx) => (
                  <option key={idx} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Country</h3>
              <input
                type="text"
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                name="country"
                value={searchParams.country}
                onChange={handleChange}
                placeholder="e.g. USA, India"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Minimum Rating</h3>
              <select
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                name="rating"
                value={searchParams.rating}
                onChange={handleChange}
              >
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Availability</h3>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  name="availability.day"
                  value={searchParams.availability.day}
                  onChange={handleChange}
                >
                  <option value="">Any Day</option>
                  {days.map((day, index) => (
                    <option key={index} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  name="availability.time"
                  value={searchParams.availability.time}
                  onChange={handleChange}
                >
                  <option value="">Any Time</option>
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applied Filters */}
          {(searchParams.subject ||
            searchParams.country ||
            searchParams.rating ||
            (searchParams.availability.day && searchParams.availability.time)) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Applied Filters</h3>
              <div className="flex flex-wrap gap-2">
                {searchParams.subject && (
                  <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {searchParams.subject}
                    <button
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                      onClick={() => setSearchParams({ ...searchParams, subject: "" })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {searchParams.country && (
                  <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {searchParams.country}
                    <button
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                      onClick={() => setSearchParams({ ...searchParams, country: "" })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {searchParams.rating && (
                  <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {searchParams.rating}+ Stars
                    <button
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                      onClick={() => setSearchParams({ ...searchParams, rating: "" })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {searchParams.availability.day && searchParams.availability.time && (
                  <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {searchParams.availability.day}, {searchParams.availability.time}
                    <button
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                      onClick={() =>
                        setSearchParams({
                          ...searchParams,
                          availability: { day: "", time: "" },
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {isLoading ? "Searching..." : `${filteredTutors.length} Results`}
          </h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sort by:</span>
            <select className="text-sm border-0 focus:ring-0 text-gray-700 font-medium">
              <option>Relevance</option>
              <option>Highest Rated</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
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
                        to={`/tutor/${tutor._id}`}
                        className="block w-full text-center bg-white border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/schedule/${tutor._id}`}
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
            <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search