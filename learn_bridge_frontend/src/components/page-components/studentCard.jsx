import { User, Calendar } from "lucide-react"
import { Link } from "react-router-dom"

const StudentCard = ({ student }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-gray-100">
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-full bg-[#6366F1] flex items-center justify-center text-white mr-4">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 font-poppins">{student.name}</h3>
          <div className="flex items-center mt-1">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {student.country}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Goals</h4>
        <ul className="space-y-1 mb-4">
          {student.learningGoals && student.learningGoals.length > 0 ? (
            student.learningGoals.slice(0, 2).map((goal, index) => (
              <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                {goal}
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500 italic">No learning goals specified</li>
          )}
          {student.learningGoals && student.learningGoals.length > 2 && (
            <li className="text-xs text-[#3B82F6] font-medium">+{student.learningGoals.length - 2} more goals</li>
          )}
        </ul>

        <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Subjects</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {student.preferredSubjects && student.preferredSubjects.length > 0 ? (
            student.preferredSubjects.map((subject, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs font-medium bg-[#3B82F6] bg-opacity-10 text-[#3B82F6]"
              >
                {subject}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No preferred subjects</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          
          <Link
            to={`/tutor/schedule/${student._id}`}
            className="flex-1 bg-[#3B82F6] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Offer Session
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudentCard
