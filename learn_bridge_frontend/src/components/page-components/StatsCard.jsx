const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const hasTrend = typeof trendValue === "number" && trend !== undefined && trend !== null;
  const trendColor =
    trendValue > 0
      ? "text-emerald-600"
      : trendValue < 0
      ? "text-rose-600"
      : "text-gray-600";
  const trendIcon = trendValue > 0 ? "↑" : trendValue < 0 ? "↓" : "";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-800 font-poppins">{value}</p>
          {hasTrend && (
            <p className={`mt-2 text-sm font-medium flex items-center ${trendColor}`}>
              <span>{trendIcon}</span>
              <span className="ml-1">
                {Math.abs(trendValue)}% {trend}
              </span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
