import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  courses: [],
  course: null,
  tutorCourses: [],
  studentCourses: [],
  isLoading: false,
  error: null,
  success: false,
}

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload
      state.isLoading = false
      state.error = null
    },
    setCourse: (state, action) => {
      state.course = action.payload
      state.isLoading = false
      state.error = null
    },
    setTutorCourses: (state, action) => {
      state.tutorCourses = action.payload
      state.isLoading = false
      state.error = null
    },
    setStudentCourses: (state, action) => {
      state.studentCourses = action.payload
      state.isLoading = false
      state.error = null
    },
    addCourse: (state, action) => {
      state.courses.push(action.payload)
      state.tutorCourses.push(action.payload)
      state.isLoading = false
      state.success = true
    },
    updateCourseInState: (state, action) => {
      state.courses = state.courses.map((course) => (course._id === action.payload._id ? action.payload : course))
      state.tutorCourses = state.tutorCourses.map((course) =>
        course._id === action.payload._id ? action.payload : course,
      )
      if (state.course && state.course._id === action.payload._id) {
        state.course = action.payload
      }
      state.isLoading = false
      state.success = true
    },
    removeCourse: (state, action) => {
      state.courses = state.courses.filter((course) => course._id !== action.payload)
      state.tutorCourses = state.tutorCourses.filter((course) => course._id !== action.payload)
      state.isLoading = false
      state.success = true
    },
    addToStudentCourses: (state, action) => {
      state.studentCourses.push(action.payload)
      state.courses = state.courses.map((course) => (course._id === action.payload._id ? action.payload : course))
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
  },
})

export const {
  setCourses,
  setCourse,
  setTutorCourses,
  setStudentCourses,
  addCourse,
  updateCourseInState,
  removeCourse,
  addToStudentCourses,
  setLoading,
  setError,
  reset,
} = courseSlice.actions

export default courseSlice.reducer
