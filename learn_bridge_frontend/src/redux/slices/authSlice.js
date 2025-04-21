import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
  initialized: false
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true
      state.error = null
    },
    loginSuccess(state, action) {
      state.isLoading = false
      state.isAuthenticated = true
      state.token = action.payload.token
      state.user = action.payload.user
      state.initialized = true
      localStorage.setItem("token", action.payload.token)
    },
    loginFailure(state, action) {
      state.isLoading = false
      state.error = action.payload
      state.initialized = true
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem("token")
    },
    getCurrentUserStart(state) {
      state.isLoading = true
      state.error = null
    },
    getCurrentUserSuccess(state, action) {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.data
      state.initialized = true
    },
    getCurrentUserFailure(state, action) {
      state.isLoading = false
      state.error = action.payload
      state.user = null
      state.isAuthenticated = false
      state.token = null
      state.initialized = true
      localStorage.removeItem("token")
    },
    updateUserPassword(state, action) {
      state.isLoading = false
      state.error = null
    },
    updateUserData(state, action) {
      state.user = { ...state.user, ...action.payload }
    },
    resetError(state) {
      state.error = null
    },
  },
})

// Action creators
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  getCurrentUserStart,
  getCurrentUserSuccess,
  getCurrentUserFailure,
  updateUserPassword,
  updateUserData,
  resetError,
} = authSlice.actions

export default authSlice.reducer