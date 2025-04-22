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
      // Check if session already exists to avoid duplicates
      const sessionExists = state.sessions.some(session => session._id === action.payload._id);
      const upcomingExists = state.upcomingSessions.some(session => session._id === action.payload._id);
      
      if (!sessionExists) {
        state.sessions.push(action.payload);
      }
      
      if (!upcomingExists && action.payload.status !== 'completed' && action.payload.status !== 'cancelled') {
        state.upcomingSessions.push(action.payload);
        
        // Sort upcoming sessions by date and time
        state.upcomingSessions.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return a.startTime.localeCompare(b.startTime);
        });
      }
      
      state.isLoading = false;
      state.success = true;
      state.error = null;
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

// Explicitly export all action creators
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