import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  users: [],
  userDetails: null,
  sessions: [],
  courses: [],
  isLoading: false,
  error: null,
  success: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
      state.isLoading = false;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      state.isLoading = false;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
      state.isLoading = false;
    },
    setSessions: (state, action) => {
      state.sessions = action.payload;
      state.isLoading = false;
    },
    setCourses: (state, action) => {
      state.courses = action.payload;
      state.isLoading = false;
    },
    
    updateUser: (state, action) => {
      state.users = state.users.map((user) => 
        user._id === action.payload._id ? action.payload : user
      );
    },
    deleteUserById: (state, action) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
    },
    resetAdminState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccess,
  setStats,
  setUsers,
  setUserDetails,
  setSessions,
  setCourses,
  setPagination,
  updateUser,
  deleteUserById,
  resetAdminState,
  clearUserDetails,
} = adminSlice.actions;

export default adminSlice.reducer;