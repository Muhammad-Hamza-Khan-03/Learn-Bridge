import { Star, Clock, Users, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"

const CourseCard = ({ course, linkTo ,onDelete}) => {
  // Add validation to prevent errors when course object is incomplete
  if (!course) {
    return <div>Loading course data...</div>;
  }

  // Create a safe tutor object with defaults if course.tutor is undefined
  const tutorInfo = course.tutor || { 
    name: "Unknown Instructor", 
    image: null,
    credentials: ""
  };

  // Safely access other properties with fallbacks
  const courseLevel = course.level || "Beginner";
  const courseTitle = course.title || "Untitled Course";
  const courseDescription = course.description || "No description available";
  const courseRating = course.rating || 0;
  const courseReviews = course.reviews || 0;
  const courseDuration = course.duration ? `${course.duration} weeks` : "N/A";
  const courseStudents = course.enrolledStudents?.length || 0;
  const courseTags = course.tags || [];
  const courseEnrolled = !!course.enrolled;
  const courseAvailableSpots = typeof course.availableSpots === 'number' ? course.availableSpots : 1;
  const coursePrice = course.price;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md group">
      <div className="relative">
        {/* Course image placeholder */}
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-gray-400" />
        </div>

        {/* Price tag */}
        {coursePrice && (
          <div className="absolute top-4 right-4 bg-white py-1 px-3 rounded-full shadow-sm">
            <span className="font-bold text-indigo-600">${coursePrice}</span>
          </div>
        )}

        {/* Level badge */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 py-1 px-3 rounded-full">
          <span className="text-xs font-medium text-white">{courseLevel}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
            {tutorInfo.image ? (
              <img
                src={tutorInfo.image}
                alt={tutorInfo.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <BookOpen className="w-4 h-4 text-indigo-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{tutorInfo.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{tutorInfo.credentials}</p>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
          {courseTitle}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{courseDescription}</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Star className="w-4 h-4 mr-1 text-amber-500" />
            <span>
              {courseRating ? courseRating.toFixed(1) : "N/A"} {courseReviews ? `(${courseReviews})` : ""}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1 text-gray-500" />
            <span>{courseDuration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1 text-gray-500" />
            <span>{courseStudents}</span>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {courseTags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <Link
          to={linkTo || `/tutor/course/${course.id || course._id || '#'}`}
          className={`block w-full text-center py-2 rounded-lg font-medium transition-colors ${
            courseEnrolled
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : courseAvailableSpots === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {courseEnrolled ? "Enrolled" : courseAvailableSpots === 0 ? "Course Full" : "View Course"}
        </Link>
      </div>
      {onDelete && (
  <button
    onClick={() => onDelete(course.id || course._id)}
    className="mt-2 w-full text-center py-2 rounded-lg text-sm font-medium transition-colors bg-rose-100 text-rose-600 hover:bg-rose-200"
  >
    Delete Course
  </button>
)}
    </div>
  )
}

export default CourseCard