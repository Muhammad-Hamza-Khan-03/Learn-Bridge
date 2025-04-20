import { BookOpen } from "lucide-react"

const CourseProgressCard = ({ course }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-500">
          {course.completedLessons}/{course.totalLessons} lessons
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{course.title}</h3>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${course.progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">{course.progress}% complete</span>
        <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
          Continue
        </button>
      </div>
    </div>
  )
}

export default CourseProgressCard
