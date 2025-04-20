// features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true
      state.error = null
    },
   
    loginFailure(state, action) {
      state.isLoading = false
      state.error = action.payload
    },
    loginSuccess(state, action) {
      state.isLoading      = false
      state.isAuthenticated= true
      state.token          = action.payload.token
      state.user           = action.payload.user
      localStorage.setItem("token", action.payload.token)
    },
    registerUser(state, action) {
      state.user           = action.payload.user
      state.token          = action.payload.token
      state.isAuthenticated= true
      localStorage.setItem("token", action.payload.token)
    },
    logout(state) {
      state.user    = null
      state.token   = null
      state.isAuth  = false
      state.error   = null
      state.isLoading = false
      localStorage.removeItem("token")
    },
    resetError(state) {
      state.error = null
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  resetError,
  registerUser
} = authSlice.actions

export default authSlice.reducer
