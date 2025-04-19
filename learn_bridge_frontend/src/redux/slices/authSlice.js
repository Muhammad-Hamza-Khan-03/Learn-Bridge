// features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: null,
  token: null,
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
    loginSuccess(state, action) {
      state.isLoading = false
      state.isAuthenticated = true
      state.token = action.payload.token
      state.user = action.payload.user
    },
    loginFailure(state, action) {
      state.isLoading = false
      state.error = action.payload
    },
    registerUser: (state, action) => {
      state.user = action.payload
      state.token = action.payload.token // assuming token is sent
      state.isAuthenticated = true

    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.isLoading = false
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
