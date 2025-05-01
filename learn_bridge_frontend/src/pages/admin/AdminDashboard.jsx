import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setStats,
  setUsers,
  setSessions,
  setCourses,
  setLoading,
  setError,
  updateUser
} from "../../redux/slices/adminSlice";
import ErrorAlert from "../../components/ui/Error-Alert";
import { LoaderCircle } from "lucide-react";
import { useToastContext } from "../../components/ui/toastContextProvider";
import { LogOut } from "lucide-react";
import Plot from 'react-plotly.js';
import { logout } from "../../redux/slices/authSlice";
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, users, sessions, courses, isLoading, error } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [userFilter, setUserFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { addToast } = useToastContext();
  useEffect(() => {
    fetchAdminStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "sessions") {
      fetchSessions();
    } else if (activeTab === "courses") {
      fetchCourses();
    }
  }, [activeTab, userFilter, sessionFilter, courseFilter]);

  const fetchAdminStats = async () => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/stats",
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      dispatch(setStats(data.data));
    } catch (err) {
      dispatch(setError(err.message || "Failed to fetch admin stats"));
    }
  };

  const fetchUsers = async () => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("token");
      const queryParams = userFilter !== "all" ? `?role=${userFilter}` : "";
      const response = await fetch(`http://localhost:5000/api/admin/users${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      dispatch(setUsers(data.data || data));
    } catch (err) {
      dispatch(setError(err.message || "Failed to fetch users"));
    }
  };

  const fetchSessions = async () => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("token")
      const queryParams = sessionFilter !== "all" ? `?status=${sessionFilter}` : "";
      const response = await fetch(`http://localhost:5000/api/admin/sessions${queryParams}`,
        {
          headers:
          {
            'Authorization': `Bearer ${token}`
          }
        });
      const data = await response.json();
      dispatch(setSessions(data.data || data));
    } catch (err) {
      dispatch(setError(err.message || "Failed to fetch sessions"));
    }
  };

  const fetchCourses = async () => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("token")
      const queryParams = courseFilter === "active" ? "?isActive=true" :
        courseFilter === "inactive" ? "?isActive=false" : "";
      const response = await fetch(`http://localhost:5000/api/courses${queryParams}`, {
        headers:
        {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      dispatch(setCourses(data.data || data));
    } catch (err) {
      dispatch(setError(err.message || "Failed to fetch courses"));
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update the courses list
        fetchCourses();
        addToast("Course deleted successfully", "success");
      } else {
        throw new Error(data.error || "Failed to delete course");
      }
    } catch (err) {
      dispatch(setError(err.message || "Failed to delete course"));

      addToast(err.message || "Failed to delete course", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCourseStatusToggle = async (courseId, isActive) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the courses list
        fetchCourses();
        addToast(`Course ${!isActive ? 'activated' : 'deactivated'} successfully`, "success");
      } else {
        throw new Error(data.error || "Failed to update course status");
      }
    } catch (err) {
      dispatch(setError(err.message || "Failed to update course status"));

      addToast(err.message || "Failed to update course status", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeleteUser = async (userId) => {
    // First confirm with the user
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update the UI by removing the user from Redux store
        dispatch(setUsers(users.filter(user => user._id !== userId)));
        // Show success message
        addToast("User deleted successfully", "success");
        // You can implement a proper toast notification system here
      } else {
        throw new Error(data.error || "Failed to delete user");
      }
    } catch (err) {
      dispatch(setError(err.message || "Failed to delete user"));

      addToast(err.message || "Failed to delete user", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleViewSession = (session) => {
    // Display session details in a modal
    addToast(`Session Details: ${session.subject} - ${session.student?.name} with ${session.tutor?.name}`, "info");
    // In a real implementation, you would open a modal with session details
  };

  const handleViewCourse = (course) => {
    // Display course details in a modal
    addToast(`Course Details: ${course.title} - ${course.subject} by ${course.tutor?.name}`, "info");
    // In a real implementation, you would open a modal with course details
  };


  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) {
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the sessions list
        fetchSessions();
        addToast("Session cancelled successfully", "success");
      } else {
        throw new Error(data.error || "Failed to cancel session");
      }
    } catch (err) {
      dispatch(setError(err.message || "Failed to cancel session"));

      addToast(err.message || "Failed to cancel session", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleUserStatusChange = async (userId, status) => {
    try {
      dispatch(setLoading(true));

      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user status");
      }

      const data = await response.json();

      // Update the user in the Redux store
      dispatch(updateUser(data.data));

      // Also update the UI directly for immediate feedback
      const updatedUsers = users.map(user =>
        user._id === userId ? { ...user, isActive: status } : user
      );
      dispatch(setUsers(updatedUsers));

      console.log("User status updated successfully");
    } catch (err) {
      console.error('Status update error:', err);
      dispatch(setError(err.message || "Failed to update user status"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  // Filter data based on search term
  const filteredUsers =
    users?.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const filteredSessions =
    sessions?.filter(
      (session) =>
        session.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.tutor?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const filteredCourses =
    courses?.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tutor?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const currentUsers = filteredUsers;
  const currentSessions = filteredSessions;
  const currentCourses = filteredCourses;

  const handleLogout = () => {
    // Disconnect any active sockets if they exist
    if (window.io && window.io.socket) {
      window.io.disconnect();
    }

    // Dispatch the logout action from Redux
    dispatch(logout());

    // Show a success message
    addToast("Logged out successfully", "success");

    // Redirect to the login page
    navigate("/signin");

  };
  const renderDashboard = () => (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoaderCircle />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium opacity-80">Total Users</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-4xl font-bold">{stats?.users?.total || 0}</p>
                  <span className="ml-2 text-sm bg-blue-700 bg-opacity-50 px-2 py-0.5 rounded-full">
                    +{stats?.users?.newLast30Days || 0} this month
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium opacity-80">Total Sessions</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-4xl font-bold">{stats?.sessions?.total || 0}</p>
                  <span className="ml-2 text-sm bg-green-700 bg-opacity-50 px-2 py-0.5 rounded-full">
                    {stats?.sessions?.completed || 0} completed
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium opacity-80">Total Messages</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-4xl font-bold">{stats?.messages?.total || 0}</p>
                  <span className="ml-2 text-sm bg-indigo-700 bg-opacity-50 px-2 py-0.5 rounded-full">
                    Active conversations
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium opacity-80">Average Rating</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-4xl font-bold">
                    {stats?.reviews?.averageRating?.toFixed(1) || "N/A"}
                    <span className="text-xl"> / 5</span>
                  </p>
                  <span className="ml-2 text-sm bg-amber-700 bg-opacity-50 px-2 py-0.5 rounded-full">
                    {stats?.reviews?.total || 0} reviews
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Growth</h3>
              <div className="h-80">
                <Plot
                  data={[
                    {
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'New Users',
                      x: ["Last Week", "2 Weeks Ago", "3 Weeks Ago", "4 Weeks Ago"],
                      y: [
                        stats?.users?.newLast30Days / 4 || 0,
                        stats?.users?.newLast30Days / 4 || 0,
                        stats?.users?.newLast30Days / 4 || 0,
                        stats?.users?.newLast30Days / 4 || 0,
                      ],
                      line: { color: 'rgba(59, 130, 246, 1)' }
                    },
                    {
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'New Sessions',
                      x: ["Last Week", "2 Weeks Ago", "3 Weeks Ago", "4 Weeks Ago"],
                      y: [
                        stats?.sessions?.newLast30Days / 4 || 0,
                        stats?.sessions?.newLast30Days / 4 || 0,
                        stats?.sessions?.newLast30Days / 4 || 0,
                        stats?.sessions?.newLast30Days / 4 || 0,
                      ],
                      line: { color: 'rgba(239, 68, 68, 1)' }
                    }
                  ]}
                  layout={{
                    height: 350,
                    margin: { t: 10, r: 10, l: 50, b: 50 },
                    legend: { orientation: 'h', y: 1.1 },
                    xaxis: {
                      title: 'Time Period'
                    },
                    yaxis: {
                      title: 'Count'
                    }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <Plot
                  data={[
                    {
                      type: 'pie',
                      values: [
                        stats?.users?.students || 0,
                        stats?.users?.tutors || 0,
                        stats?.users?.total - (stats?.users?.students || 0) - (stats?.users?.tutors || 0) || 0,
                      ],
                      labels: ["Students", "Tutors", "Admins"],
                      marker: {
                        colors: ['rgba(59, 130, 246, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(245, 158, 11, 0.7)']
                      },
                      hoverinfo: 'label+percent',
                      textinfo: 'value'
                    }
                  ]}
                  layout={{
                    height: 300,
                    margin: { t: 10, b: 10, l: 10, r: 10 },
                    showlegend: true,
                    legend: { orientation: 'h', y: -0.1 }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Status</h3>
              <div className="h-64 flex items-center justify-center">
                <Plot
                  data={[
                    {
                      type: 'pie',
                      values: [
                        stats?.sessions?.pending || 0,
                        stats?.sessions?.accepted || 0,
                        stats?.sessions?.completed || 0,
                        stats?.sessions?.total -
                        (stats?.sessions?.pending || 0) -
                        (stats?.sessions?.accepted || 0) -
                        (stats?.sessions?.completed || 0) || 0,
                      ],
                      labels: ["Pending", "Accepted", "Completed", "Cancelled"],
                      marker: {
                        colors: [
                          "rgba(245, 158, 11, 0.7)",
                          "rgba(59, 130, 246, 0.7)",
                          "rgba(16, 185, 129, 0.7)",
                          "rgba(239, 68, 68, 0.7)",
                        ]
                      },
                      hoverinfo: 'label+percent',
                      textinfo: 'value'
                    }
                  ]}
                  layout={{
                    height: 300,
                    margin: { t: 10, b: 10, l: 10, r: 10 },
                    showlegend: true,
                    legend: { orientation: 'h', y: -0.1 }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Popular Subjects</h3>
              <div className="h-64">
                <Plot
                  data={[
                    {
                      type: 'bar',
                      x: stats?.popularSubjects?.map((subject) => subject._id) || [],
                      y: stats?.popularSubjects?.map((subject) => subject.count) || [],
                      marker: {
                        color: 'rgba(16, 185, 129, 0.7)'
                      }
                    }
                  ]}
                  layout={{
                    height: 300,
                    margin: { t: 10, r: 10, l: 50, b: 80 },
                    xaxis: {
                      tickangle: -45
                    },
                    yaxis: {
                      title: 'Sessions'
                    }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions?.slice(0, 5).map((session, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Session</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.subject} - {session.student?.name} with {session.tutor?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : session.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!sessions || sessions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent activity found
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">User Management</h3>

        <div className="inline-flex rounded-md shadow-sm">
          <button
            className={`px-4 py-2 text-sm font-medium ${userFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border border-gray-300 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setUserFilter("all");
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${userFilter === "student" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setUserFilter("student");
              setCurrentPage(1);
            }}
          >
            Students
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${userFilter === "tutor" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setUserFilter("tutor");
              setCurrentPage(1);
            }}
          >
            Tutors
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${userFilter === "admin" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setUserFilter("admin");
              setCurrentPage(1);
            }}
          >
            Admins
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "student"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "tutor"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.country}</td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <label className="inline-flex relative items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={user.isActive}
                                  onChange={() => handleUserStatusChange(user._id, !user.isActive)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </label>
                            </div>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                                onClick={() => openUserModal(user)}
                              >
                                View
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchTerm ? "No users found matching your search" : "No users found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === Math.ceil(filteredUsers.length / itemsPerPage)
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      onClick={() =>
                        currentPage < Math.ceil(filteredUsers.length / itemsPerPage) &&
                        paginate(currentPage + 1)
                      }
                      disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderSessionManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">Session Management</h3>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            className={`px-4 py-2 text-sm font-medium ${sessionFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border border-gray-300 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setSessionFilter("all");
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${sessionFilter === "pending" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setSessionFilter("pending");
              setCurrentPage(1);
            }}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${sessionFilter === "accepted" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setSessionFilter("accepted");
              setCurrentPage(1);
            }}
          >
            Accepted
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${sessionFilter === "completed" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setSessionFilter("completed");
              setCurrentPage(1);
            }}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${sessionFilter === "rejected" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setSessionFilter("rejected");
              setCurrentPage(1);
            }}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search by subject, student or tutor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentSessions.length > 0 ? (
                      currentSessions.map((session) => (
                        <tr key={session._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.student?.name || "Unknown"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.tutor?.name || "Unknown"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.startTime} - {session.endTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : session.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : session.status === "accepted"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                                    onClick={() => handleViewSession(session)}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                                    onClick={() => handleCancelSession(session._id)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchTerm ? "No sessions found matching your search" : "No sessions found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredSessions.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {Array.from({ length: Math.ceil(filteredSessions.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === Math.ceil(filteredSessions.length / itemsPerPage)
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      onClick={() =>
                        currentPage < Math.ceil(filteredSessions.length / itemsPerPage) &&
                        paginate(currentPage + 1)
                      }
                      disabled={currentPage === Math.ceil(filteredSessions.length / itemsPerPage)}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderCourseManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">Course Management</h3>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            className={`px-4 py-2 text-sm font-medium ${courseFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border border-gray-300 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setCourseFilter("all");
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${courseFilter === "active" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setCourseFilter("active");
              setCurrentPage(1);
            }}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${courseFilter === "inactive" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"} border-t border-b border-r border-gray-300 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            onClick={() => {
              setCourseFilter("inactive");
              setCurrentPage(1);
            }}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search by title, subject or tutor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.length > 0 ? (
                      currentCourses.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.tutor?.name || "Unknown"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.enrolledStudents?.length || 0}/{course.maxStudents}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${((course.enrolledStudents?.length || 0) / course.maxStudents) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(course.startDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap"> 
                            <div className="flex items-center">
                              <label className="inline-flex relative items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={course.isActive}
                                  onChange={() => handleCourseStatusToggle(course._id, course.isActive)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                  {course.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                                    onClick={() => handleViewCourse(course)}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                                    onClick={() => handleDeleteCourse(course._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchTerm ? "No courses found matching your search" : "No courses found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredCourses.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {Array.from({ length: Math.ceil(filteredCourses.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === Math.ceil(filteredCourses.length / itemsPerPage)
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      onClick={() =>
                        currentPage < Math.ceil(filteredCourses.length / itemsPerPage) &&
                        paginate(currentPage + 1)
                      }
                      disabled={currentPage === Math.ceil(filteredCourses.length / itemsPerPage)}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
      {error && (
        <div className="mb-6">
          <ErrorAlert error={error} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "dashboard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => {
                setActiveTab("users");
                setCurrentPage(1);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Users
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "sessions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => {
                setActiveTab("sessions");
                setCurrentPage(1);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Sessions
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "courses"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => {
                setActiveTab("courses");
                setCurrentPage(1);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Courses
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "users" && renderUserManagement()}
        {activeTab === "sessions" && renderSessionManagement()}
        {activeTab === "courses" && renderCourseManagement()}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeUserModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      User Details
                    </h3>
                    <div className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-700">Name:</span> {selectedUser.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium text-gray-700">Email:</span> {selectedUser.email}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium text-gray-700">Role:</span> {selectedUser.role}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium text-gray-700">Country:</span> {selectedUser.country}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium text-gray-700">Status:</span> {selectedUser.isActive ? "Active" : "Inactive"}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium text-gray-700">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          {selectedUser.role === "student" && (
                            <>
                              <h6 className="text-sm font-medium text-gray-700">Learning Goals:</h6>
                              <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                                {selectedUser.learningGoals?.map((goal, index) => <li key={index}>{goal}</li>) || (
                                  <li>No learning goals specified</li>
                                )}
                              </ul>

                              <h6 className="text-sm font-medium text-gray-700 mt-3">Preferred Subjects:</h6>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {selectedUser.preferredSubjects?.map((subject, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {subject}
                                  </span>
                                )) || <span className="text-sm text-gray-500">No preferred subjects specified</span>}
                              </div>
                            </>
                          )}

                          {selectedUser.role === "tutor" && (
                            <>
                              <h6 className="text-sm font-medium text-gray-700">Expertise:</h6>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {selectedUser.expertise?.map((exp, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {exp}
                                  </span>
                                )) || <span className="text-sm text-gray-500">No expertise specified</span>}
                              </div>

                              <p className="text-sm text-gray-500 mt-3">
                                <span className="font-medium text-gray-700">Hourly Rate:</span> ${selectedUser.hourlyRate || 0}/hour
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                <span className="font-medium text-gray-700">Experience:</span> {selectedUser.experience || 0} years
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                <span className="font-medium text-gray-700">Education:</span> {selectedUser.education || "Not specified"}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                <span className="font-medium text-gray-700">Rating:</span> {selectedUser.averageRating?.toFixed(1) || "N/A"}/5 (
                                {selectedUser.totalReviews || 0} reviews)
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h6 className="text-sm font-medium text-gray-700">Bio:</h6>
                        <p className="mt-1 text-sm text-gray-500">{selectedUser.bio || "No bio provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Edit User
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeUserModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;