import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setUsers,
  setLoading,
  setError,
  updateUser,
  deleteUserById
} from "../../redux/slices/adminSlice";
import { LoaderCircle } from "lucide-react";
import ErrorAlert from "../../components/ui/ErrorAlert";

const AdminUserManagement = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.admin);
  const [adminUsers, setAdminUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    bio: "",
    adminLevel: "junior",
    permissions: ["user_management", "content_moderation"]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch admin users on component mount
  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Filter admin users when users array changes
  useEffect(() => {
    if (users && users.length > 0) {
      const filteredAdmins = users.filter(user => user.role === "admin");
      setAdminUsers(filteredAdmins);
    }
  }, [users]);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchAdminUsers = async () => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/users?role=admin", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      dispatch(setUsers(data.data || data));
    } catch (err) {
      dispatch(setError(err.message || "Failed to fetch admin users"));
      setLocalError(err.message || "Failed to fetch admin users");
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const updatedPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];

      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      country: "",
      bio: "",
      adminLevel: "junior",
      permissions: ["user_management", "content_moderation"]
    });
    setShowCreateModal(true);
  };

  // Open edit modal for a user
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't show password
      country: user.country || "",
      bio: user.bio || "",
      adminLevel: user.adminLevel || "junior",
      permissions: user.permissions || ["user_management"]
    });
    setShowEditModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setLocalError(null);
  };

  // Create new admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password) {
        setLocalError("Name, email and password are required");
        setIsSubmitting(false);
        return;
      }

      // Create admin user data
      const adminData = {
        ...formData,
        role: "admin"
      };

      // Send request to create admin
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Admin user created successfully!");
        closeModals();
        // Refresh admin list
        fetchAdminUsers();
      } else {
        throw new Error(data.error || "Failed to create admin user");
      }
    } catch (err) {
      setLocalError(err.message || "Failed to create admin user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update admin
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      // Validate form
      if (!formData.name || !formData.email) {
        setLocalError("Name and email are required");
        setIsSubmitting(false);
        return;
      }

      // Create update data (exclude password if empty)
      const updateData = {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        bio: formData.bio,
        adminLevel: formData.adminLevel,
        permissions: formData.permissions
      };

      // Add password only if provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      const token = localStorage.getItem("token");
      // Send request to update admin
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Admin user updated successfully!");
        closeModals();
        // Update user in Redux store
        dispatch(updateUser(data.data));
        // Refresh admin list
        fetchAdminUsers();
      } else {
        throw new Error(data.error || "Failed to update admin user");
      }
    } catch (err) {
      setLocalError(err.message || "Failed to update admin user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle admin status (active/inactive)
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Admin status ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        // Update user in Redux store
        dispatch(updateUser(data.data));
        // Refresh admin list
        fetchAdminUsers();
      } else {
        throw new Error(data.error || "Failed to update admin status");
      }
    } catch (err) {
      setLocalError(err.message || "Failed to update admin status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      dispatch(setLoading(true));

      // Get token from local storage
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove user from Redux store
        dispatch(deleteUserById(userId));
        // Refresh user list
        fetchUsers();
        alert("User deleted successfully!");
      } else {
        throw new Error(data.error || "Failed to delete user");
      }
    } catch (err) {
      dispatch(setError(err.message || "Failed to delete user"));
      alert(err.message || "Failed to delete user");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this admin user?")) {
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Admin user deleted successfully!");
        // Remove user from Redux store
        dispatch(deleteUserById(userId));
        // Refresh admin list
        fetchAdminUsers();
      } else {
        throw new Error(data.error || "Failed to delete admin user");
      }
    } catch (err) {
      setLocalError(err.message || "Failed to delete admin user");
    }
  };

  // Filter admins by search term
  const filteredAdmins = adminUsers.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin User Management</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
          onClick={openCreateModal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Admin
        </button>
      </div>

      {(error || localError) && (
        <div className="mb-4">
          <ErrorAlert error={error || localError} onDismiss={() => setLocalError(null)} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
          <button
            type="button"
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccessMessage(null)}
          >
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm("")}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Level</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.adminLevel === 'super'
                              ? 'bg-red-100 text-red-800'
                              : admin.adminLevel === 'senior'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                            {admin.adminLevel || 'junior'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions?.map((permission, index) => (
                              <span key={index} className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">
                                {permission.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <label className="inline-flex relative items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={admin.isActive !== false}
                                onChange={() => handleToggleStatus(admin._id, admin.isActive !== false)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ml-3 text-sm font-medium text-gray-700">
                                {admin.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                              onClick={() => openEditModal(admin)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                              onClick={() => handleDeleteAdmin(admin._id)}
                              disabled={admin.adminLevel === 'super'}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm
                          ? "No admin users found matching your search"
                          : "No admin users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModals}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Create New Admin User
                    </h3>
                    <div className="mt-4">
                      {localError && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                          <span className="block sm:inline">{localError}</span>
                        </div>
                      )}

                      <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input
                              type="text"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                            />
                          </div>

                          <div>
                            <label htmlFor="adminLevel" className="block text-sm font-medium text-gray-700">Admin Level</label>
                            <select
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              id="adminLevel"
                              name="adminLevel"
                              value={formData.adminLevel}
                              onChange={handleChange}
                            >
                              <option value="junior">Junior</option>
                              <option value="senior">Senior</option>
                              <option value="super">Super</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                          <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="bio"
                            name="bio"
                            rows="2"
                            value={formData.bio}
                            onChange={handleChange}
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="user_management"
                                checked={formData.permissions.includes("user_management")}
                                onChange={() => handlePermissionChange("user_management")}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="user_management">
                                User Management
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="content_moderation"
                                checked={formData.permissions.includes("content_moderation")}
                                onChange={() => handlePermissionChange("content_moderation")}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="content_moderation">
                                Content Moderation
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="platform_analytics"
                                checked={formData.permissions.includes("platform_analytics")}
                                onChange={() => handlePermissionChange("platform_analytics")}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="platform_analytics">
                                Platform Analytics
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="full_access"
                                checked={formData.permissions.includes("full_access")}
                                onChange={() => handlePermissionChange("full_access")}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="full_access">
                                Full Access
                              </label>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCreateAdmin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Admin"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModals}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModals}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Edit Admin User
                    </h3>
                    <div className="mt-4">
                      {localError && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                          <span className="block sm:inline">{localError}</span>
                        </div>
                      )}

                      <form onSubmit={handleUpdateAdmin} className="space-y-4">
                        <div>
                          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="edit-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="edit-email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">
                            Password (leave blank to keep current password)
                          </label>
                          <input
                            type="password"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="edit-password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input
                              type="text"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              id="edit-country"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                            />
                          </div>

                          <div>
                            <label htmlFor="edit-adminLevel" className="block text-sm font-medium text-gray-700">Admin Level</label>
                            <select
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              id="edit-adminLevel"
                              name="adminLevel"
                              value={formData.adminLevel}
                              onChange={handleChange}
                              disabled={selectedUser.adminLevel === 'super'}
                            >
                              <option value="junior">Junior</option>
                              <option value="senior">Senior</option>
                              <option value="super">Super</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="edit-bio" className="block text-sm font-medium text-gray-700">Bio</label>
                          <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            id="edit-bio"
                            name="bio"
                            rows="2"
                            value={formData.bio}
                            onChange={handleChange}
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="edit-user_management"
                                checked={formData.permissions.includes("user_management")}
                                onChange={() => handlePermissionChange("user_management")}
                                disabled={selectedUser.adminLevel === 'super'}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="edit-user_management">
                                User Management
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="edit-content_moderation"
                                checked={formData.permissions.includes("content_moderation")}
                                onChange={() => handlePermissionChange("content_moderation")}
                                disabled={selectedUser.adminLevel === 'super'}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="edit-content_moderation">
                                Content Moderation
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="edit-platform_analytics"
                                checked={formData.permissions.includes("platform_analytics")}
                                onChange={() => handlePermissionChange("platform_analytics")}
                                disabled={selectedUser.adminLevel === 'super'}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="edit-platform_analytics">
                                Platform Analytics
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                type="checkbox"
                                id="edit-full_access"
                                checked={formData.permissions.includes("full_access")}
                                onChange={() => handlePermissionChange("full_access")}
                                disabled={selectedUser.adminLevel === 'super'}
                              />
                              <label className="ml-2 block text-sm text-gray-700" htmlFor="edit-full_access">
                                Full Access
                              </label>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleUpdateAdmin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Admin"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModals}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;