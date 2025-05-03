import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { loginStart, loginSuccess, loginFailure, resetError } from "../../redux/slices/authSlice"
import { BookOpen, ArrowRight, Mail, Lock, ChevronLeft, Sun, Moon, AlertCircle } from "lucide-react"
import { useTheme } from "../../components/ui/theme-context"
import { useToastContext } from "../../components/ui/toastContextProvider"
// Add ErrorAlert component
const ErrorAlert = ({ error, onDismiss }) => {
  const { theme } = useTheme()

  return (
    <div
      className={`mb-6 p-4 rounded-lg flex items-start ${theme === "dark" ? "bg-red-900/50 border border-red-800" : "bg-red-100 border border-red-200"}`}
    >
      <AlertCircle className={`h-5 w-5 mt-0.5 mr-3 ${theme === "dark" ? "text-red-400" : "text-red-500"}`} />
      <div className="flex-1">
        <p className={`${theme === "dark" ? "text-red-300" : "text-red-700"}`}>{error}</p>
      </div>
      <button
        onClick={onDismiss}
        className={`ml-3 ${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"}`}
      >
        &times;
      </button>
    </div>
  )
}

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth)
  const { theme, toggleTheme } = useTheme()

  const { email, password } = formData

  const AUTH_BASE = "http://localhost:5000/api/auth"
  const { addToast } = useToastContext();

  // Add useEffect for redirection
  useEffect(() => {
  // Redirect if already logged in
  if (isAuthenticated && user) {
    const redirectPath =
      user.role === "student"
        ? "/student/dashboard"
        : user.role === "tutor"
          ? "/tutor/dashboard"
          : user.role === "admin"
            ? "/admin/dashboard"
            : "/";

    navigate(redirectPath);
  }


    // Reset errors when component unmounts
    return () => {
      dispatch(resetError())
    }
  }, [isAuthenticated, user, navigate, dispatch])

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    // Clear field error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null,
      })
    }

    // Clear Redux error if present
    if (error) dispatch(resetError())
  }

  const validateForm = () => {
    const errors = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid"
    }

    if (!password) {
      errors.password = "Password is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    dispatch(loginStart());
  
    try {
      const res = await fetch(`${AUTH_BASE}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
  
      const payload = await res.json();
  
      if (!res.ok) {
        const msg = payload.error || payload.message || "Login failed";
        dispatch(loginFailure(msg));
        addToast(msg, "error");
        return;
      }
  
      // Success - save token and update Redux store
      localStorage.setItem("token", payload.token);
      
      dispatch(loginSuccess({ 
        token: payload.token, 
        user: payload.user
      }));
      
      addToast("Login successful!", "success");
    } catch (err) {
      dispatch(loginFailure(err.message || "Something went wrong"));
      addToast(err.message || "Something went wrong", "error");
    }
  };

  const handleDismissError = () => {
    dispatch(resetError())
  }

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

      {/* Sign In Form */}
      <section className="pt-28 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div
              className={`${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-sm rounded-xl p-8 shadow-xl`}
            >
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 inline-block mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Welcome Back
                  </span>
                </h1>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  Sign in to continue your learning journey
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {error && <ErrorAlert error={error} onDismiss={handleDismissError} />}

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
                      className={`w-full pl-10 pr-3 py-2 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        formErrors.email ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your email"
                    />
                    {formErrors.email && <p className="absolute text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className={`text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                      className={`w-full pl-10 pr-3 py-2 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        formErrors.password ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your password"
                    />
                    {formErrors.password && <p className="absolute text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
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
                      Logging in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className={`${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} font-medium`}
                    >
                      Sign up
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
