import { useState, useEffect } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  loginStart,
  loginSuccess,
  loginFailure,
  resetError,
} from "../../redux/slices/authSlice"
import ErrorAlert from "../ui/Error-Alert"
import { X, BookOpen } from "lucide-react"
import { useToastContext

 } from "../ui/toastContextProvider"
const AUTH_BASE = "http://localhost:5000/api/auth"

export default function SignInModal({ isModalOpen, setIsModalOpen, theme }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, error } = useSelector((s) => s.auth)
  const { addToast } = useToastContext();
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    console.log("[SignInModal] Auth State ->", {
      user,
      isAuthenticated,
      isLoading,
      error,
    })
  }, [user, isAuthenticated, isLoading, error])
   // Clear errors on open/close
   useEffect(() => {
    dispatch(resetError())
    return () => { dispatch(resetError()) }
  }, [dispatch, isModalOpen])

  // On successful login, close modal & redirect
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      setIsModalOpen(false);
      let dest;  
      if(user.role === "student")
          dest = "/student/dashboard"
      else if (user.role === "tutor") 
        dest =  "/tutor/dashboard"
      else if(user.role === "admin")
        dest = "/admin/dashboard"
      else{
        dest = "/";
      }
      
      navigate(dest);
    }
  }, [isAuthenticated, user, navigate, setIsModalOpen]);

  const validate = () => {
    const errs = {}
    if (!formData.email) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = "Email is invalid"
    if (!formData.password) errs.password = "Password is required"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (formErrors[e.target.name]) {
      setFormErrors((f) => ({ ...f, [e.target.name]: null }))
    }
    if (error) dispatch(resetError())
  }

 // In sign-in.jsx (modal component)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  dispatch(loginStart());

  try {
    const res = await fetch(`${AUTH_BASE}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    // Store token and update Redux
    localStorage.setItem("token", payload.token);
    
    dispatch(loginSuccess({ 
      token: payload.token,
      user:payload.user
    }));
    
    addToast("Login successful!", "success");
    setIsModalOpen(false);
  } catch (err) {
    dispatch(loginFailure(err.message || "Something went wrong"));
    addToast(err.message || "Something went wrong", "error");
  }
};

  if (!isModalOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setIsModalOpen(false)}
      />

      <div
        className={`relative ${
          theme === "dark"
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-300"
        } rounded-xl p-8 w-full max-w-md`}
      >
        <button
          onClick={() => setIsModalOpen(false)}
          className={`absolute top-4 right-4 ${
            theme === "dark"
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2 inline-block mb-4">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h3
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Sign In
          </h3>
        </div>

        {error && (
          <ErrorAlert error={error} onDismiss={() => dispatch(resetError())} />
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              } mb-1`}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`w-full rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700 text-white"
                  : "bg-gray-50 border border-gray-300 text-gray-900"
              } ${formErrors.email ? "ring-2 ring-red-500" : ""}`}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              } mb-1`}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700 text-white"
                  : "bg-gray-50 border border-gray-300 text-gray-900"
              } ${formErrors.password ? "ring-2 ring-red-500" : ""}`}
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded focus:ring-blue-500 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-300"
                }`}
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Remember me
              </label>
            </div>
           
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center mt-4">
            <span
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Don't have an account?
            </span>{" "}
            {error && (
          <ErrorAlert error={error} onDismiss={() => dispatch(resetError())} />
        )}

            <Link to="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
