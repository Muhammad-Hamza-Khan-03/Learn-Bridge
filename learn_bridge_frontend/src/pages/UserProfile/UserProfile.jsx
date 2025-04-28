import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { User, Book, Briefcase, Lock, Save, Plus, Trash2, X } from "lucide-react"
import { updateProfile, setLoading, setError, setSuccess, setPasswordUpdateSuccess } from "../../redux/slices/UserSlice"
import { updateUserPassword, updateUserData } from "../../redux/slices/authSlice"
import { useToast } from "../../components/ui/toast-notifications"
import { ToastContainer } from "../../components/ui/toast-notifications"
const UserProfile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { isLoading } = useSelector((state) => state.users)
  const { toasts, addToast, removeToast } = useToast()

  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    country: "",
    bio: "",
  })
  const [studentData, setStudentData] = useState({
    learningGoals: [""],
    preferredSubjects: [""],
  })
  const [tutorData, setTutorData] = useState({
    expertise: [""],
    availability: [{ day: "Monday", startTime: "09:00", endTime: "17:00" }],
    hourlyRate: 0,
    education: "",
    experience: 0,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState({})

  // Fetch current user if not available
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        dispatch(setLoading());
        
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const userData = await response.json();
        
        // Update auth state with user data
        dispatch(updateUserData(userData.data));
      } catch (error) {
        console.error("Error fetching user data:", error);
        dispatch(setError(error.message));
        addToast("Failed to load user profile", "error");
      }
    };
    
    if (!user && localStorage.getItem("token")) {
      fetchCurrentUser();
    }
  }, [dispatch, user, addToast]);

  // Set form data when user is available
  useEffect(() => {
    if (user) {
      // Set basic profile data
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        country: user.country || "",
        bio: user.bio || "",
      })

      // Set role-specific data
      if (user.role === "student" && user.learningGoals) {
        setStudentData({
          learningGoals: user.learningGoals.length > 0 ? user.learningGoals : [""],
          preferredSubjects: user.preferredSubjects?.length > 0 ? user.preferredSubjects : [""],
        })
      } else if (user.role === "tutor") {
        setTutorData({
          expertise: user.expertise?.length > 0 ? user.expertise : [""],
          availability:
            user.availability?.length > 0
              ? user.availability
              : [{ day: "Monday", startTime: "09:00", endTime: "17:00" }],
          hourlyRate: user.hourlyRate || 0,
          education: user.education || "",
          experience: user.experience || 0,
        })
      }
    }
  }, [user])

  
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handleStudentChange = (field, index, value) => {
    const updated = [...studentData[field]]
    updated[index] = value
    setStudentData({
      ...studentData,
      [field]: updated,
    })
  }

  const addStudentField = (field) => {
    setStudentData({
      ...studentData,
      [field]: [...studentData[field], ""],
    })
  }

  const removeStudentField = (field, index) => {
    if (studentData[field].length > 1) {
      const updated = [...studentData[field]]
      updated.splice(index, 1)
      setStudentData({
        ...studentData,
        [field]: updated,
      })
    }
  }

  const handleTutorChange = (e) => {
    setTutorData({
      ...tutorData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...tutorData.availability]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setTutorData({
      ...tutorData,
      availability: updated,
    })
  }

  const addAvailability = () => {
    setTutorData({
      ...tutorData,
      availability: [...tutorData.availability, { day: "Monday", startTime: "09:00", endTime: "17:00" }],
    })
  }

  const removeAvailability = (index) => {
    if (tutorData.availability.length > 1) {
      const updated = [...tutorData.availability]
      updated.splice(index, 1)
      setTutorData({
        ...tutorData,
        availability: updated,
      })
    }
  }

  const handleExpertiseChange = (index, value) => {
    const updated = [...tutorData.expertise]
    updated[index] = value
    setTutorData({
      ...tutorData,
      expertise: updated,
    })
  }

  const addExpertise = () => {
    setTutorData({
      ...tutorData,
      expertise: [...tutorData.expertise, ""],
    })
  }

  const removeExpertise = (index) => {
    if (tutorData.expertise.length > 1) {
      const updated = [...tutorData.expertise]
      updated.splice(index, 1)
      setTutorData({
        ...tutorData,
        expertise: updated,
      })
    }
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const validateProfileForm = () => {
    const errors = {}

    if (!profileData.name) errors.name = "Name is required"
    if (!profileData.email) errors.email = "Email is required"
    if (!profileData.country) errors.country = "Country is required"

    // Role-specific validation
    if (user?.role === "student") {
      if (studentData.learningGoals.some((goal) => !goal.trim())) {
        errors.learningGoals = "All learning goals must be filled"
      }
      if (studentData.preferredSubjects.some((subject) => !subject.trim())) {
        errors.preferredSubjects = "All preferred subjects must be filled"
      }
    } else if (user?.role === "tutor") {
      if (tutorData.expertise.some((exp) => !exp.trim())) {
        errors.expertise = "All expertise fields must be filled"
      }
      if (!tutorData.education) errors.education = "Education is required"
      if (tutorData.hourlyRate < 0) errors.hourlyRate = "Hourly rate cannot be negative"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required"
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters"
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
  
    if (validateProfileForm()) {
      // Prepare data based on role - only include relevant fields
      let updateData = { ...profileData }
  
      if (user?.role === "student") {
        updateData = {
          name: profileData.name,
          email: profileData.email,
          country: profileData.country,
          bio: profileData.bio,
          learningGoals: studentData.learningGoals.filter((goal) => goal.trim()),
          preferredSubjects: studentData.preferredSubjects.filter((subject) => subject.trim()),
        }
      } else if (user?.role === "tutor") {
        updateData = {
          name: profileData.name,
          email: profileData.email,
          country: profileData.country, 
          bio: profileData.bio,
          expertise: tutorData.expertise.filter((exp) => exp.trim()),
          availability: tutorData.availability,
          hourlyRate: Number.parseFloat(tutorData.hourlyRate),
          education: tutorData.education,
          experience: Number.parseInt(tutorData.experience),
        }
      }
  
      try {
        dispatch(setLoading());
        
        const response = await fetch("http://localhost:5000/api/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update profile")
        }

        const data = await response.json()
        
        // Update both Redux slices
        dispatch(updateProfile(data))
        dispatch(updateUserData(data))
        dispatch(setSuccess())
        
        addToast("Profile updated successfully!", "success")
      } catch (error) {
        console.error("Error updating profile:", error)
        dispatch(setError(error.message || "Failed to update profile"))
        addToast(error.message || "Failed to update profile", "error")
      }
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
  
    if (validatePasswordForm()) {
      try {
        // Set loading state in Redux
        dispatch(setLoading());
        
        // CHANGE THIS URL to match your backend route
        const response = await fetch("http://localhost:5000/api/auth/updatepassword", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        })
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update password")
        }
  
        // Rest of your function remains the same
        dispatch(updateUserPassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }))
        
        dispatch(setPasswordUpdateSuccess())
  
        // Reset form fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        
        addToast("Password updated successfully!", "success")
      } catch (error) {
        console.error("Error updating password:", error)
        dispatch(setError(error.message || "Failed to update password"))
        addToast(error.message || "Failed to update password", "error")
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#6366F1] flex items-center justify-center text-white mb-4">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{user?.name}</h2>
              <p className="text-sm text-gray-600 capitalize mb-4">{user?.role || "User"}</p>
              <div className="w-full border-t border-gray-200 pt-4 mt-2">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                {user?.country && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Country:</span> {user?.country}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="divide-y divide-gray-100">
              <button
                className={`w-full text-left px-4 py-3 flex items-center text-sm transition-colors ${
                  activeTab === "profile"
                    ? "bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <User className="w-5 h-5 mr-3" />
                <span>Basic Information</span>
              </button>

              {user?.role === "student" && (
                <button
                  className={`w-full text-left px-4 py-3 flex items-center text-sm transition-colors ${
                    activeTab === "student"
                      ? "bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("student")}
                >
                  <Book className="w-5 h-5 mr-3" />
                  <span>Learning Preferences</span>
                </button>
              )}

              {user?.role === "tutor" && (
                <button
                  className={`w-full text-left px-4 py-3 flex items-center text-sm transition-colors ${
                    activeTab === "tutor"
                      ? "bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("tutor")}
                >
                  <Briefcase className="w-5 h-5 mr-3" />
                  <span>Tutor Information</span>
                </button>
              )}

              <button
                className={`w-full text-left px-4 py-3 flex items-center text-sm transition-colors ${
                  activeTab === "password"
                    ? "bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("password")}
              >
                <Lock className="w-5 h-5 mr-3" />
                <span>Change Password</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
              </div>
            ) : (
              <>
                {/* Basic profile information */}
                {activeTab === "profile" && (
                  <form onSubmit={handleProfileSubmit}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 font-poppins">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className={`w-full p-2 rounded-lg border ${
                            formErrors.name ? "border-rose-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                          value={profileData.name}
                          onChange={handleProfileChange}
                        />
                        {formErrors.name && <p className="mt-1 text-sm text-rose-500">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={`w-full p-2 rounded-lg border ${
                            formErrors.email ? "border-rose-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                          value={profileData.email}
                          onChange={handleProfileChange}
                        />
                        {formErrors.email && <p className="mt-1 text-sm text-rose-500">{formErrors.email}</p>}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        className={`w-full p-2 rounded-lg border ${
                          formErrors.country ? "border-rose-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                        value={profileData.country}
                        onChange={handleProfileChange}
                      />
                      {formErrors.country && <p className="mt-1 text-sm text-rose-500">{formErrors.country}</p>}
                    </div>

                    <div className="mb-6">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="4"
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Student-specific information */}
                {activeTab === "student" && user?.role === "student" && (
                  <form onSubmit={handleProfileSubmit}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 font-poppins">Learning Preferences</h2>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Learning Goals</label>
                        <button
                          type="button"
                          className="text-sm text-[#3B82F6] hover:text-opacity-80 transition-colors flex items-center"
                          onClick={() => addStudentField("learningGoals")}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Goal
                        </button>
                      </div>
                      {formErrors.learningGoals && (
                        <p className="text-sm text-rose-500 mb-2">{formErrors.learningGoals}</p>
                      )}
                      <div className="space-y-3">
                        {studentData.learningGoals.map((goal, index) => (
                          <div key={`goal-${index}`} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                              value={goal}
                              onChange={(e) => handleStudentChange("learningGoals", index, e.target.value)}
                              placeholder="Enter a learning goal"
                            />
                            <button
                              type="button"
                              className="p-2 text-rose-500 hover:text-rose-700 transition-colors"
                              onClick={() => removeStudentField("learningGoals", index)}
                              disabled={studentData.learningGoals.length === 1}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Preferred Subjects</label>
                        <button
                          type="button"
                          className="text-sm text-[#3B82F6] hover:text-opacity-80 transition-colors flex items-center"
                          onClick={() => addStudentField("preferredSubjects")}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Subject
                        </button>
                      </div>
                      {formErrors.preferredSubjects && (
                        <p className="text-sm text-rose-500 mb-2">{formErrors.preferredSubjects}</p>
                      )}
                      <div className="space-y-3">
                        {studentData.preferredSubjects.map((subject, index) => (
                          <div key={`subject-${index}`} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                              value={subject}
                              onChange={(e) => handleStudentChange("preferredSubjects", index, e.target.value)}
                              placeholder="Enter a preferred subject"
                            />
                            <button
                              type="button"
                              className="p-2 text-rose-500 hover:text-rose-700 transition-colors"
                              onClick={() => removeStudentField("preferredSubjects", index)}
                              disabled={studentData.preferredSubjects.length === 1}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Tutor-specific information */}
                {activeTab === "tutor" && user?.role === "tutor" && (
                  <form onSubmit={handleProfileSubmit}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 font-poppins">Tutor Information</h2>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Expertise</label>
                        <button
                          type="button"
                          className="text-sm text-[#3B82F6] hover:text-opacity-80 transition-colors flex items-center"
                          onClick={addExpertise}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Expertise
                        </button>
                      </div>
                      {formErrors.expertise && <p className="text-sm text-rose-500 mb-2">{formErrors.expertise}</p>}
                      <div className="space-y-3">
                        {tutorData.expertise.map((expertise, index) => (
                          <div key={`expertise-${index}`} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                              value={expertise}
                              onChange={(e) => handleExpertiseChange(index, e.target.value)}
                              placeholder="Enter a subject you teach"
                            />
                            <button
                              type="button"
                              className="p-2 text-rose-500 hover:text-rose-700 transition-colors"
                              onClick={() => removeExpertise(index)}
                              disabled={tutorData.expertise.length === 1}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                        Education
                      </label>
                      <input
                        type="text"
                        id="education"
                        name="education"
                        className={`w-full p-2 rounded-lg border ${
                          formErrors.education ? "border-rose-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                        value={tutorData.education}
                        onChange={handleTutorChange}
                        placeholder="e.g. Master's in Mathematics, Stanford University"
                      />
                      {formErrors.education && <p className="mt-1 text-sm text-rose-500">{formErrors.education}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          id="hourlyRate"
                          name="hourlyRate"
                          className={`w-full p-2 rounded-lg border ${
                            formErrors.hourlyRate ? "border-rose-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                          value={tutorData.hourlyRate}
                          onChange={handleTutorChange}
                          min="0"
                          step="0.01"
                        />
                        {formErrors.hourlyRate && <p className="mt-1 text-sm text-rose-500">{formErrors.hourlyRate}</p>}
                      </div>
                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          id="experience"
                          name="experience"
                          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                          value={tutorData.experience}
                          onChange={handleTutorChange}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">Availability</label>
                        <button
                          type="button"
                          className="text-sm text-[#3B82F6] hover:text-opacity-80 transition-colors flex items-center"
                          onClick={addAvailability}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Availability Slot
                        </button>
                      </div>
                      <div className="space-y-4">
                        {tutorData.availability.map((slot, index) => (
                          <div key={`availability-${index}`} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="text-sm font-medium text-gray-700">Availability Slot {index + 1}</h3>
                              <button
                                type="button"
                                className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                                onClick={() => removeAvailability(index)}
                                disabled={tutorData.availability.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Day</label>
                                <select
                                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                                  value={slot.day}
                                  onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)}
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
                                <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                                <input
                                  type="time"
                                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                                  value={slot.startTime}
                                  onChange={(e) => handleAvailabilityChange(index, "startTime", e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                                <input
                                  type="time"
                                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                                  value={slot.endTime}
                                  onChange={(e) => handleAvailabilityChange(index, "endTime", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Password change */}
                {activeTab === "password" && (
                  <form onSubmit={handlePasswordSubmit}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 font-poppins">Change Password</h2>

                    <div className="mb-6">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        className={`w-full p-2 rounded-lg border ${
                          formErrors.currentPassword ? "border-rose-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                      {formErrors.currentPassword && (
                        <p className="mt-1 text-sm text-rose-500">{formErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        className={`w-full p-2 rounded-lg border ${
                          formErrors.newPassword ? "border-rose-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                      {formErrors.newPassword && <p className="mt-1 text-sm text-rose-500">{formErrors.newPassword}</p>}
                    </div>

                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`w-full p-2 rounded-lg border ${
                          formErrors.confirmPassword ? "border-rose-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent`}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-rose-500">{formErrors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Update Password
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default UserProfile