import { Star, Clock, Users, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"

const CourseCard = ({ course, linkTo }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md group">
      <div className="relative">
        {/* Course image placeholder */}
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-gray-400" />
        </div>

        {/* Price tag */}
        {course.price && (
          <div className="absolute top-4 right-4 bg-white py-1 px-3 rounded-full shadow-sm">
            <span className="font-bold text-indigo-600">${course.price}</span>
          </div>
        )}

        {/* Level badge */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 py-1 px-3 rounded-full">
          <span className="text-xs font-medium text-white">{course.level}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-2">
          <img
            src={course.tutor.image || "/placeholder.svg"}
            alt={course.tutor.name}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">{course.tutor.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{course.tutor.credentials}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Star className="w-4 h-4 mr-1 text-amber-500" />
            <span>
              {course.rating ? course.rating.toFixed(1) : "N/A"} {course.reviews ? `(${course.reviews})` : ""}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1 text-gray-500" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1 text-gray-500" />
            <span>{course.students}</span>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {course.tags &&
            course.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
        </div>

        <Link
          to={linkTo || `/student/course/${course.id}`}
          className={`block w-full text-center py-2 rounded-lg font-medium transition-colors ${
            course.enrolled
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : course.availableSpots === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {course.enrolled ? "Enrolled" : course.availableSpots === 0 ? "Course Full" : "View Course"}
        </Link>
      </div>
    </div>
  )
}

export default CourseCard
