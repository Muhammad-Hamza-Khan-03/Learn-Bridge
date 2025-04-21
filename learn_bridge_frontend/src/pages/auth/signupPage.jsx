import { useState,useEffect } from "react"

import {
  BookOpen,
  ArrowRight,
  User,
  Mail,
  Lock,
  MapPin,
  FileText,
  Plus,
  Minus,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react"
import {useDispatch,useSelector} from "react-redux"
import { useTheme } from "../../components/ui/theme-context"
import { resetError,loginSuccess } from "../../redux/slices/authSlice"
import { Link, useNavigate } from "react-router-dom"
import { useToastContext } from "../../components/ui/toastContextProvider"
import { getCountryNames } from "../../mock/places"
const SignupPage = () => {

  const AUTH_BASE = "http://localhost:5000/api/auth"
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    role: "student",
    country: "",
    bio: "",
  })

const [studentData, setStudentData] = useState({
  learningGoals: [""],
  preferredSubjects: [""],
  availability: [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]
})

const [tutorData, setTutorData] = useState({
  expertise: [""],
  hourlyRate: 0,
  education: "",
  experience: 0,
  availability: [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]
})
const [countryList] = useState(getCountryNames());
  const { addToast } = useToastContext()
  const [formErrors, setFormErrors] = useState({})
  const [ispageLoading, setIspageLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()
const navigate = useNavigate();
  const { name, email, password, password2, role, country, bio } = formData
  const dispatch = useDispatch()
  const { user, isAuthenticated, error, isLoading ,token} = useSelector((state) => state.auth)

  
  // Redirect the user 
  useEffect(() => {
  // only run once auth flips to true and we actually have a role
  if (isAuthenticated && user && user.role) {
    console.log("redirecting:", user.role);
    switch (user.role) {
      case "student":
        navigate("/student/landing");
        break;
      case "tutor":
        navigate("/tutor/landing");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/");
    }
  }
  return () => { dispatch(resetError()) }
}, [isAuthenticated, user, navigate,dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const onStudentChange = (e, index) => {
    const { name, value } = e.target
    const list = [...studentData[name]]
    list[index] = value
    setStudentData({ ...studentData, [name]: list })
  }

  const onTutorChange = (e, index) => {
    const { name, value } = e.target
    if (name === "hourlyRate" || name === "experience") {
      setTutorData({ ...tutorData, [name]: value })
    } else if (name === "education") {
      setTutorData({ ...tutorData, [name]: value })
    } else {
      const list = [...tutorData[name]]
      list[index] = value
      setTutorData({ ...tutorData, [name]: list })
    }
  }

  const addStudentField = (field) => {
    setStudentData({
      ...studentData,
      [field]: [...studentData[field], ""],
    })
  }

  const removeStudentField = (field, index) => {
    const list = [...studentData[field]]
    list.splice(index, 1)
    setStudentData({ ...studentData, [field]: list })
  }

  const addTutorField = (field) => {
    setTutorData({
      ...tutorData,
      [field]: [...tutorData[field], ""],
    })
  }

  const removeTutorField = (field, index) => {
    const list = [...tutorData[field]]
    list.splice(index, 1)
    setTutorData({ ...tutorData, [field]: list })
  }

  const validateForm = () => {
    const errors = {}

    if (!name) errors.name = "Name is required"

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (password !== password2) {
      errors.password2 = "Passwords do not match"
    }

if (!country) errors.country = "Please select your country"
    if (role === "tutor") {
      if (!tutorData.education) errors.education = "Education is required"
      if (tutorData.expertise.some((item) => !item)) errors.expertise = "All expertise fields must be filled"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

 // In signupPage.jsx
const onSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIspageLoading(true);

  const commonData = {
    ...formData,
    ...(role === "student" ? {
      ...studentData,
      availability: studentData.availability.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    } : {}),
    ...(role === "tutor" ? {
      ...tutorData,
      availability: tutorData.availability.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    } : {})
  };
  delete commonData.password2;

  try {
    const response = await fetch(`${AUTH_BASE}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commonData),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }
    
    // Store token and user info in Redux
    localStorage.setItem("token", data.token);
    dispatch(loginSuccess({ 
      token: data.token, 
      user: data.user 
    }));
    
    addToast("Registration successful!", "success");
  } catch (err) {
    console.error("Signup error:", err);
    addToast(err.message, "error");
  } finally {
    setIspageLoading(false);
  }
};

const handleAvailabilityChange = (role, index, field, value) => {
  const stateUpdater = role === 'student' ? setStudentData : setTutorData;
  const currentData = role === 'student' ? studentData : tutorData;
  
  const updated = [...currentData.availability];
  updated[index] = {
    ...updated[index],
    [field]: value
  };
  
  stateUpdater({
    ...currentData,
    availability: updated
  });
};

const addAvailability = (role) => {
  const stateUpdater = role === 'student' ? setStudentData : setTutorData;
  const currentData = role === 'student' ? studentData : tutorData;
  
  stateUpdater({
    ...currentData,
    availability: [
      ...currentData.availability,
      { day: "Monday", startTime: "09:00", endTime: "17:00" }
    ]
  });
};

const removeAvailability = (role, index) => {
  const stateUpdater = role === 'student' ? setStudentData : setTutorData;
  const currentData = role === 'student' ? studentData : tutorData;
  
  if (currentData.availability.length > 1) {
    const updated = [...currentData.availability];
    updated.splice(index, 1);
    
    stateUpdater({
      ...currentData,
      availability: updated
    });
  }
};

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-900"}`}
    >
      {/* Header */}
      <header
        className={`fixed w-full top-0 z-50 ${theme === "dark" ? "bg-gray-900/80 backdrop-blur-md border-b border-gray-800" : "bg-white/80 backdrop-blur-md border-b border-gray-200"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2 mr-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  LearnBridge
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${theme === "dark" ? "bg-gray-800 text-gray-300 hover:text-white" : "bg-gray-200 text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link
                to="/"
                className={`${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200 flex items-center`}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <section className="pt-28 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-8 shadow-xl`}
            >
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 inline-block mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Create Your Account
                  </span>
                </h1>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Join our community and start your learning journey today
                </p>
              </div>

              {/* Role Selection */}
              <div className="mb-8">
                <div
                  className={`inline-flex p-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-lg mx-auto block`}
                >
                  <button
                    onClick={() => setFormData({ ...formData, role: "student" })}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${role === "student"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : theme === "dark"
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, role: "tutor" })}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${role === "tutor"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : theme === "dark"
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Full Name
                    </label>
                    <div className={`relative ${formErrors.name ? "mb-6" : "mb-0"}`}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={onChange}
                        className={`w-full pl-10 pr-3 py-2 ${theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                          } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${formErrors.name ? "border-red-500" : ""
                          }`}
                        placeholder="Enter your full name"
                      />
                      {formErrors.name && <p className="absolute text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Email Address
                    </label>
                    <div className={`relative ${formErrors.email ? "mb-6" : "mb-0"}`}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        className={`w-full pl-10 pr-3 py-2 ${theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                          } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${formErrors.email ? "border-red-500" : ""
                          }`}
                        placeholder="Enter your email"
                      />
                      {formErrors.email && <p className="absolute text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Password
                    </label>
                    <div className={`relative ${formErrors.password ? "mb-6" : "mb-0"}`}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        className={`w-full pl-10 pr-3 py-2 ${theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                          } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${formErrors.password ? "border-red-500" : ""
                          }`}
                        placeholder="Create a password"
                      />
                      {formErrors.password && (
                        <p className="absolute text-red-500 text-xs mt-1">{formErrors.password}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password2"
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Confirm Password
                    </label>
                    <div className={`relative ${formErrors.password2 ? "mb-6" : "mb-0"}`}>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="password"
                        id="password2"
                        name="password2"
                        value={password2}
                        onChange={onChange}
                        className={`w-full pl-10 pr-3 py-2 ${theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                          } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${formErrors.password2 ? "border-red-500" : ""
                          }`}
                        placeholder="Confirm your password"
                      />
                      {formErrors.password2 && (
                        <p className="absolute text-red-500 text-xs mt-1">{formErrors.password2}</p>
                      )}
                    </div>
                  </div>

                  <div>
    <label
      htmlFor="country"
      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
    >
      Country
    </label>
    <div className={`relative ${formErrors.country ? "mb-6" : "mb-0"}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MapPin className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
      </div>
      <select
        id="country"
        name="country"
        value={country}
        onChange={onChange}
        className={`w-full pl-10 pr-3 py-2 ${
          theme === "dark"
            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
        } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          formErrors.country ? "border-red-500" : ""
        }`}
      >
        <option value="">Select your country</option>
        {countryList.map(countryName => (
          <option key={countryName} value={countryName}>
            {countryName}
          </option>
        ))}
      </select>
      {formErrors.country && <p className="absolute text-red-500 text-xs mt-1">{formErrors.country}</p>}
    </div>
  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-1`}
                    >
                      Bio
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <FileText className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      </div>
                      <textarea
                        id="bio"
                        name="bio"
                        value={bio}
                        onChange={onChange}
                        rows="3"
                        className={`w-full pl-10 pr-3 py-2 ${theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                          } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                        placeholder="Tell us about yourself"
                      ></textarea>
                    </div>
                  </div>
                </div>
{/* Availability Section - for both student and tutor roles */}
<div>
  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}>
    Availability
  </label>
  {(role === 'student' ? studentData : tutorData).availability.map((slot, index) => (
    <div key={`availability-${index}`} className="card mb-2 p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label className="block text-sm mb-1">Day</label>
          <select
            className={`w-full pl-3 pr-3 py-2 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } rounded-lg border focus:outline-none`}
            value={slot.day}
            onChange={(e) => handleAvailabilityChange(role, index, "day", e.target.value)}
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Start Time</label>
          <input
            type="time"
            className={`w-full pl-3 pr-3 py-2 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } rounded-lg border focus:outline-none`}
            value={slot.startTime}
            onChange={(e) => handleAvailabilityChange(role, index, "startTime", e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <div className="flex-grow mr-2">
            <label className="block text-sm mb-1">End Time</label>
            <input
              type="time"
              className={`w-full pl-3 pr-3 py-2 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } rounded-lg border focus:outline-none`}
              value={slot.endTime}
              onChange={(e) => handleAvailabilityChange(role, index, "endTime", e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeAvailability(role, index)}
            disabled={(role === 'student' ? studentData : tutorData).availability.length === 1}
            className={`px-3 py-2.5 ${
              theme === "dark"
                ? "bg-gray-600 hover:bg-gray-500 text-white border-gray-600"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
            } rounded-lg border ${
              (role === 'student' ? studentData : tutorData).availability.length === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Minus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  ))}
  <button
    type="button"
    onClick={() => addAvailability(role)}
    className={`mt-2 flex items-center text-sm ${
      theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
    }`}
  >
    <Plus className="h-4 w-4 mr-1" /> Add Availability Slot
  </button>
</div>
                {/* Role-specific fields */}
                {role === "student" && (
                  <div
                    className={`mt-8 p-6 rounded-lg ${theme === "dark" ? "bg-gray-700/50 border border-gray-600" : "bg-gray-50 border border-gray-200"}`}
                  >
                    <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                      Student Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                        >
                          Learning Goals
                        </label>
                        {studentData.learningGoals.map((goal, index) => (
                          <div key={`goal-${index}`} className="flex mb-2">
                            <input
                              type="text"
                              name="learningGoals"
                              value={goal}
                              onChange={(e) => onStudentChange(e, index)}
                              className={`flex-grow pl-3 pr-3 py-2 ${theme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                                } rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                              placeholder="Enter a learning goal"
                            />
                            <button
                              type="button"
                              onClick={() => removeStudentField("learningGoals", index)}
                              disabled={studentData.learningGoals.length === 1}
                              className={`px-3 ${theme === "dark"
                                  ? "bg-gray-600 hover:bg-gray-500 text-white border-gray-600"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                                } rounded-r-lg border border-l-0 ${studentData.learningGoals.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addStudentField("learningGoals")}
                          className={`mt-2 flex items-center text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                            }`}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Learning Goal
                        </button>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                        >
                          Preferred Subjects
                        </label>
                        {studentData.preferredSubjects.map((subject, index) => (
                          <div key={`subject-${index}`} className="flex mb-2">
                            <input
                              type="text"
                              name="preferredSubjects"
                              value={subject}
                              onChange={(e) => onStudentChange(e, index)}
                              className={`flex-grow pl-3 pr-3 py-2 ${theme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                                } rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                              placeholder="Enter a preferred subject"
                            />
                            <button
                              type="button"
                              onClick={() => removeStudentField("preferredSubjects", index)}
                              disabled={studentData.preferredSubjects.length === 1}
                              className={`px-3 ${theme === "dark"
                                  ? "bg-gray-600 hover:bg-gray-500 text-white border-gray-600"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                                } rounded-r-lg border border-l-0 ${studentData.preferredSubjects.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addStudentField("preferredSubjects")}
                          className={`mt-2 flex items-center text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                            }`}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Preferred Subject
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {role === "tutor" && (
                  <div
                    className={`mt-8 p-6 rounded-lg ${theme === "dark" ? "bg-gray-700/50 border border-gray-600" : "bg-gray-50 border border-gray-200"}`}
                  >
                    <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                      Teacher Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                        >
                          Expertise
                        </label>
                        {tutorData.expertise.map((exp, index) => (
                          <div key={`exp-${index}`} className="flex mb-2">
                            <input
                              type="text"
                              name="expertise"
                              value={exp}
                              onChange={(e) => onTutorChange(e, index)}
                              className={`flex-grow pl-3 pr-3 py-2 ${theme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                                  : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                                } rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${formErrors.expertise ? "border-red-500" : ""
                                }`}
                              placeholder="Enter a subject you teach"
                            />
                            <button
                              type="button"
                              onClick={() => removeTutorField("expertise", index)}
                              disabled={tutorData.expertise.length === 1}
                              className={`px-3 ${theme === "dark"
                                  ? "bg-gray-600 hover:bg-gray-500 text-white border-gray-600"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                                } rounded-r-lg border border-l-0 ${tutorData.expertise.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        {formErrors.expertise && <p className="text-red-500 text-xs mt-1">{formErrors.expertise}</p>}
                        <button
                          type="button"
                          onClick={() => addTutorField("expertise")}
                          className={`mt-2 flex items-center text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                            }`}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Expertise
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor="hourlyRate"
                          className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                        >
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          id="hourlyRate"
                          name="hourlyRate"
                          value={tutorData.hourlyRate}
                          onChange={(e) => onTutorChange(e)}
                          min="0"
                          className={`w-full pl-3 pr-3 py-2 ${theme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                            } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="education"
                          className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                        >
                          Education
                        </label>
                        <input
                          type="text"
                          id="education"
                          name="education"
                          value={tutorData.education}
                          onChange={(e) => onTutorChange(e)}
                          className={`w-full pl-3 pr-3 py-2 ${theme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                            } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${formErrors.education ? "border-red-500" : ""
                            }`}
                          placeholder="Enter your educational background"
                        />
                        {formErrors.education && <p className="text-red-500 text-xs mt-1">{formErrors.education}</p>}
                      </div>

                      <div>
                        <label
                          htmlFor="experience"
                          className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-2`}
                        >
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          id="experience"
                          name="experience"
                          value={tutorData.experience}
                          onChange={(e) => onTutorChange(e)}
                          min="0"
                          className={`w-full pl-3 pr-3 py-2 ${theme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white focus:border-blue-500"
                              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                            } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={ispageLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                >
                  {ispageLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Already have an account?{" "}
                    <Link
                      to="/signin"
                      className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} font-medium`}
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`${theme === "dark" ? "bg-gray-900 border-t border-gray-800" : "bg-white border-t border-gray-200"} py-8`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2 mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                LearnBridge
              </span>
            </div>

            <div className="flex space-x-6">
              <Link
                to="#"
                className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                Terms
              </Link>
              <Link
                to="#"
                className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                Privacy
              </Link>
              <Link
                to="#"
                className={`${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                Help
              </Link>
            </div>
          </div>

          <div
            className={`mt-8 pt-8 ${theme === "dark" ? "border-t border-gray-800 text-gray-400" : "border-t border-gray-200 text-gray-500"} text-center text-sm`}
          >
            <p>&copy; {new Date().getFullYear()} LearnBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
export default SignupPage