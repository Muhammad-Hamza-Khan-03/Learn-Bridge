"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Sample session data (dates with sessions)
  const sessionsData = [
    { date: new Date(2025, 3, 21), type: "math" },
    { date: new Date(2025, 3, 22), type: "physics" },
    { date: new Date(2025, 3, 25), type: "english" },
    { date: new Date(2025, 3, 28), type: "math" },
  ]

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const sessionOnDay = sessionsData.find(
        (session) =>
          session.date.getDate() === day && session.date.getMonth() === month && session.date.getFullYear() === year,
      )

      let sessionIndicator = null
      if (sessionOnDay) {
        const colorMap = {
          math: "bg-indigo-500",
          physics: "bg-emerald-500",
          english: "bg-amber-500",
        }

        sessionIndicator = <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${colorMap[sessionOnDay.type]}`}></div>
      }

      const isToday =
        new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

      days.push(
        <div
          key={day}
          className={`h-8 flex flex-col items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-gray-100 ${
            isToday ? "bg-indigo-100 text-indigo-600 font-medium" : ""
          }`}
        >
          <span className="text-sm">{day}</span>
          {sessionIndicator}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="calendar">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-md font-medium text-gray-800">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div key={index} className="text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
          <span className="text-gray-600">Math</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
          <span className="text-gray-600">Physics</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
          <span className="text-gray-600">English</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarComponent
