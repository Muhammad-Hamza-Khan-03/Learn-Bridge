// learn_bridge_frontend/src/redux/slices/SessionSlice.js
import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  sessions: [],
  upcomingSessions: [],
  sessionHistory: [],
  currentSession: null,
  isLoading: false,
  error: null,
  success: false,
}

const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setSessions: (state, action) => {
      state.sessions = action.payload
      state.isLoading = false
      state.error = null
    },
    setUpcomingSessions: (state, action) => {
      state.upcomingSessions = action.payload
      state.isLoading = false
      state.error = null
    },
    setSessionHistory: (state, action) => {
      state.sessionHistory = action.payload
      state.isLoading = false
      state.error = null
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload
      state.isLoading = false
      state.error = null
    },
    addSession: (state, action) => {
      state.sessions.push(action.payload)
      state.upcomingSessions.push(action.payload)
      state.isLoading = false
      state.success = true
    },
    updateSession: (state, action) => {
      const updatedSession = action.payload

      // Update in all session lists
      state.sessions = state.sessions.map((session) => (session._id === updatedSession._id ? updatedSession : session))

      state.upcomingSessions = state.upcomingSessions.map((session) =>
        session._id === updatedSession._id ? updatedSession : session,
      )

      state.sessionHistory = state.sessionHistory.map((session) =>
        session._id === updatedSession._id ? updatedSession : session,
      )

      if (state.currentSession && state.currentSession._id === updatedSession._id) {
        state.currentSession = updatedSession
      }

      state.isLoading = false
      state.success = true
    },
    setLoading: (state) => {
      state.isLoading = true
      state.error = null
    },
    setError: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    reset: (state) => {
      state.isLoading = false
      state.error = null
      state.success = false
    },
    clearCurrentSession: (state) => {
      state.currentSession = null
    },
  },
})

export const {
  setSessions,
  setUpcomingSessions,
  setSessionHistory,
  setCurrentSession,
  addSession,
  updateSession,
  setLoading,
  setError,
  reset,
  clearCurrentSession,
} = sessionSlice.actions

export default sessionSlice.reducer