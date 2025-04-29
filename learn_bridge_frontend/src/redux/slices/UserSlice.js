import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  tutors: [],
  students: [],
  currentTutor: null,
  currentStudent: null,
  isLoading: false,
  error: null,
  success: false,
  passwordUpdateSuccess: false,
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setLoading(state) {
      state.isLoading = true
      state.error = null
    },
    setError(state, action) {
      state.isLoading = false
      state.error = action.payload
      state.success = false
    },
    setSuccess(state) {
      state.isLoading = false
      state.success = true
      state.error = null
    },
    setTutors(state, action) {
      state.tutors = action.payload
      state.isLoading = false
      state.error = null
    },
    setStudents(state, action) {
      state.students = action.payload
      state.isLoading = false
      state.error = null
    },
    setCurrentTutor(state, action) {
      state.currentTutor = action.payload
      state.isLoading = false
      state.error = null
    },
    setCurrentStudent(state, action) {
      state.currentStudent = action.payload
      state.isLoading = false
      state.error = null
    },
    setPasswordUpdateSuccess(state) {
      state.isLoading = false
      state.passwordUpdateSuccess = true
      state.error = null
    },
    updateProfile(state, action) {
      state.isLoading = false
      state.success = true
      state.error = null
    }
  },
})

export const {
  setLoading,
  setError,
  setSuccess,
  setTutors,
  setStudents,
  setCurrentTutor,
  setCurrentStudent,
  setPasswordUpdateSuccess,
  updateProfile
} = userSlice.actions

export default userSlice.reducer