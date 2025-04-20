const StatsCard = ({ title, value, icon: Icon, color }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    )
  }
  
  export default StatsCard
  