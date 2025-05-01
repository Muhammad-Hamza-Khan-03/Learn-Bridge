import { useState, useEffect } from "react"
import {
  BookOpen,
  Calendar,
  MessageCircle,
  Video,
  Clock,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  User,
  Laptop,
  Sun,
  Moon,
} from "lucide-react"
import {useTheme } from "../../components/ui/theme-context"
import SignInModal from "../../components/auth-modals/sign-in"
import studentImage from "../../assets/student.png";
import TutorImage from "../../assets/tutor.png"
import homeImage from "../../assets/home.jpg"
function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loginType, setLoginType] = useState("student")
  const [activeFeature, setActiveFeature] = useState(0)
  const { theme, toggleTheme } = useTheme()
//   const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth)

  const features = [
    {
      title: "Course Management",
      description:
        "Create, manage, and enroll in courses tailored to your educational needs. Organize content and track progress.",
      icon: <BookOpen className="h-8 w-8 text-white" />,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Smart Scheduling",
      description:
        "Book sessions based on availability, ratings, and preferences. Find the perfect time slot that works for everyone.",
      icon: <Calendar className="h-8 w-8 text-white" />,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Meeting Tracking",
      description:
        "Keep track of all your past and upcoming tutoring sessions. Never miss an appointment with smart reminders.",
      icon: <Clock className="h-8 w-8 text-white" />,
      gradient: "from-pink-500 to-pink-600",
    },
    {
      title: "HD Video Conferencing",
      description:
        "Connect through high-quality video and audio for seamless learning. Share screens and collaborate in real-time.",
      icon: <Video className="h-8 w-8 text-white" />,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      title: "Instant Messaging",
      description:
        "Communicate with your tutor or student before, during, and after sessions. Share files and resources easily.",
      icon: <MessageCircle className="h-8 w-8 text-white" />,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Status Updates",
      description:
        "Real-time status updates and transitions keep everyone informed about meeting progress and next steps.",
      icon: <Laptop className="h-8 w-8 text-white" />,
      gradient: "from-pink-500 to-blue-600",
    },
  ]

  // Add auto-rotation for features carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [features.length])

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
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2 mr-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  LearnBridge
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className={`${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className={`${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                How It Works
              </a>
              <a
                href="#for-students"
                className={`${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                For Students
              </a>
              <a
                href="#for-teachers"
                className={`${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                For Teachers
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${theme === "dark" ? "bg-gray-800 text-gray-300 hover:text-white" : "bg-gray-200 text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button
                onClick={() => {
                  setLoginType("student")
                  setIsModalOpen(true)
                }}
                className={`${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setLoginType("student")
                  setIsModalOpen(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme toggle button for mobile */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${theme === "dark" ? "bg-gray-800 text-gray-300 hover:text-white" : "bg-gray-200 text-gray-600 hover:text-gray-900"} transition-colors duration-200`}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} focus:outline-none`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden ${theme === "dark" ? "bg-gray-900 border-b border-gray-800" : "bg-white border-b border-gray-200"}`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#features"
                className={`block px-3 py-2 rounded-md text-base font-medium ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className={`block px-3 py-2 rounded-md text-base font-medium ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#for-students"
                className={`block px-3 py-2 rounded-md text-base font-medium ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                For Students
              </a>
              <a
                href="#for-teachers"
                className={`block px-3 py-2 rounded-md text-base font-medium ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                For Teachers
              </a>
              <div className={`pt-4 pb-3 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
                <button
                  onClick={() => {
                    setLoginType("student")
                    setIsModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setLoginType("student")
                    setIsModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="mt-2 block w-full px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Fix Video Positioning */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div
            className={`absolute top-0 left-0 w-full h-full ${theme === "dark" ? "bg-gradient-to-b from-blue-900/20 to-transparent" : "bg-gradient-to-b from-blue-100/40 to-transparent"}`}
          ></div>
          <div
            className={`absolute bottom-0 left-0 w-full h-1/2 ${theme === "dark" ? "bg-gradient-to-t from-gray-900 to-transparent" : "bg-gradient-to-t from-gray-100 to-transparent"}`}
          ></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                <span className={`block ${theme === "dark" ? "" : "text-gray-900"}`}>Transform Your</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Learning Experience
                </span>
              </h1>
              <p className={`text-xl ${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-8 leading-relaxed`}>
                Connect with expert tutors or find eager students on our advanced educational platform. Schedule
                sessions, manage courses, and interact in real-time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setLoginType("student")
                    setIsModalOpen(true)
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  Start as Student
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setLoginType("teacher")
                    setIsModalOpen(true)
                  }}
                  className={`${theme === "dark" ? "bg-gray-800 hover:bg-gray-700 border border-gray-700" : "bg-white hover:bg-gray-100 border border-gray-300"} text-${theme === "dark" ? "white" : "gray-900"} px-8 py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center`}
                >
                  Start as Teacher
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 relative z-10">
              <div className="relative w-full h-full z-10 shadow-2xl">
                <div
                  className={`relative ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700" : "bg-gradient-to-r from-gray-100 to-white border border-gray-300"} p-3 rounded-2xl overflow-hidden`}
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-full ${theme === "dark" ? "bg-gray-900/10" : "bg-gray-100/10"} backdrop-blur-sm z-0`}
                  ></div>
                  <div className="rounded-xl overflow-hidden relative z-10">
                    <img
                      src={homeImage}
                      alt="Platform Preview"
                      width={800}
                      height={600}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Floating elements - repositioned */}
             
              
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className={`py-20 ${theme === "dark" ? "bg-gray-900/50" : "bg-gray-100/50"} backdrop-blur-sm relative`}
      >
        <div className="absolute inset-0 z-0">
          <div
            className={`absolute top-0 right-0 w-full h-full ${theme === "dark" ? "bg-gradient-to-b from-blue-900/10 to-transparent" : "bg-gradient-to-b from-blue-100/30 to-transparent"}`}
          ></div>
          <div
            className={`absolute bottom-0 left-0 w-full h-1/2 ${theme === "dark" ? "bg-gradient-to-t from-gray-900 to-transparent" : "bg-gradient-to-t from-gray-100 to-transparent"}`}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              How{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                It Works
              </span>
            </h2>
            <p className={`text-xl ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Our platform makes it easy to connect, learn, and achieve your educational goals.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className={`inline-flex p-1 ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} rounded-lg`}>
              <button
                onClick={() => setActiveTab("student")}
                className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "student"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : theme === "dark"
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setActiveTab("teacher")}
                className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "teacher"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : theme === "dark"
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For Teachers
              </button>
            </div>
          </div>

          {/* Student Content - Fix Dashboard Display */}
          {activeTab === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="space-y-8">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Create Your Profile
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Sign up and create your student profile with your learning goals and subjects of interest.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Browse Courses & Tutors
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Explore available courses or find tutors based on subject, rating, and availability.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Schedule Sessions
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Book one-on-one sessions at times that work for your schedule.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Learn & Track Progress
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Connect through video, chat with your tutor, and monitor your educational journey.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setLoginType("student")
                    setIsModalOpen(true)
                  }}
                  className="mt-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-flex items-center"
                >
                  Get Started as Student
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>

              <div className="order-1 md:order-2 relative z-10">
                <div
                  className={`relative z-10 ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700" : "bg-gradient-to-r from-gray-100 to-white border border-gray-300"} p-3 rounded-2xl shadow-2xl`}
                >
                  <div className="rounded-xl overflow-hidden relative z-10">
                    <img
                      src={studentImage}
                      alt="Student Dashboard"
                      width={600}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                
              </div>
            </div>
          )}

          {/* Teacher Content - Fix Dashboard Display */}
          {activeTab === "teacher" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative z-10">
                <div
                  className={`relative z-10 ${theme === "dark" ? "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700" : "bg-gradient-to-r from-gray-100 to-white border border-gray-300"} p-3 rounded-2xl shadow-2xl`}
                >
                  <div className="rounded-xl overflow-hidden relative z-10">
                    <img
                      src={TutorImage}
                      alt="Teacher Dashboard"
                      width={600}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                </div>

               
              </div>

              <div>
                <div className="space-y-8">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Create Your Teacher Profile
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Sign up and showcase your expertise, teaching experience, and subject specialties.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Create & Manage Courses
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Design and publish courses with detailed descriptions and learning objectives.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Set Your Availability
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Define your teaching schedule and accept meeting requests from students.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "" : "text-gray-900"}`}>
                        Teach & Track Progress
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        Conduct engaging video sessions and monitor your students' progress through our comprehensive
                        tracking system.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setLoginType("teacher")
                    setIsModalOpen(true)
                  }}
                  className="mt-10 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-flex items-center"
                >
                  Get Started as Teacher
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* For Students Section */}
      <section id="for-students" className="py-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              For{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Students
              </span>
            </h2>
            <p className={`text-xl ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Discover how our platform helps you achieve your academic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${theme === "dark" ? "hover:bg-gray-800/80" : "hover:bg-white"}`}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "" : "text-gray-900"}`}>Course Catalog</h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Browse and enroll in a wide range of courses taught by expert tutors. Filter by subject, level, and
                rating.
              </p>
            </div>

            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${theme === "dark" ? "hover:bg-gray-800/80" : "hover:bg-white"}`}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "" : "text-gray-900"}`}>
                Flexible Scheduling
              </h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Book sessions that fit your schedule. Choose tutors based on availability, ratings, and teaching style.
              </p>
            </div>

            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${theme === "dark" ? "hover:bg-gray-800/80" : "hover:bg-white"}`}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "" : "text-gray-900"}`}>Session Tracking</h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Keep track of all your past and upcoming learning sessions. Review past lessons and prepare for future
                ones.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => {
                setLoginType("student")
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 inline-flex items-center"
            >
              Join as Student
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* For Teachers Section */}
      <section
        id="for-teachers"
        className={`py-20 ${theme === "dark" ? "bg-gray-900/50" : "bg-gray-100/50"} backdrop-blur-sm relative`}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              For{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Teachers
              </span>
            </h2>
            <p className={`text-xl ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Discover how our platform helps you share your knowledge and grow your tutoring business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${theme === "dark" ? "hover:bg-gray-800/80" : "hover:bg-white"}`}
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "" : "text-gray-900"}`}>Course Creation</h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Create and manage your own courses. Upload materials, set learning objectives, and structure your
                curriculum.
              </p>
            </div>

            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${theme === "dark" ? "hover:bg-gray-800/80" : "hover:bg-white"}`}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "" : "text-gray-900"}`}>
                Schedule Management
              </h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Set your availability and accept meeting requests. Manage your teaching schedule efficiently.
              </p>
            </div>

            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 ${theme === "dark" ? "hover:bg-gray-800/80" : "hover:bg-white"}`}
            >
              <div className="bg-gradient-to-r from-pink-500 to-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Video className="h-7 w-7 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "" : "text-gray-900"}`}>Teaching Tools</h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Access powerful teaching tools including video conferencing, screen sharing, and interactive
                whiteboards.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => {
                setLoginType("teacher")
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 inline-flex items-center"
            >
              Join as Teacher
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`${theme === "dark" ? "bg-gray-900 border-t border-gray-800" : "bg-white border-t border-gray-200"} py-12`}
      >
        <div
          className={`mt-8 pt-8 ${theme === "dark" ? "border-t border-gray-800 text-gray-400" : "border-t border-gray-200 text-gray-500"} text-center text-sm`}
        >
          <p>&copy; {new Date().getFullYear()} LearnBridge. All rights reserved.</p>
        </div>
      </footer>

     
<SignInModal
  isModalOpen={isModalOpen}
  setIsModalOpen={setIsModalOpen}
  theme={theme}
/>
    </div>
  )
}

// Wrap the App component with ThemeProvider
export default function AppWithTheme() {
  return (
      <LandingPage />
    
  )
}
