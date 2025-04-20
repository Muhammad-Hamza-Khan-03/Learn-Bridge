import {
    mockUser,
    mockTutors,
    mockCourses,
    mockUpcomingSessions,
    mockSessionHistory,
    mockStudentCourses,
  } from "./mockData"
  
  // Simulate API delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  
  // Mock API functions
  export const mockApi = {
    // Auth endpoints
    auth: {
      getCurrentUser: async () => {
        await delay(500)
        return { data: mockUser }
      },
      login: async (credentials) => {
        await delay(800)
        return { data: { user: mockUser, token: "mock-token-12345" } }
      },
      logout: async () => {
        await delay(300)
        return { success: true }
      },
    },
  
    // Users endpoints
    users: {
      getTutors: async () => {
        await delay(700)
        return { data: mockTutors }
      },
      getTutorById: async (id) => {
        await delay(500)
        const tutor = mockTutors.find((t) => t._id === id)
        if (!tutor) throw new Error("Tutor not found")
        return { data: tutor }
      },
      searchTutors: async (query) => {
        await delay(800)
        // Simple search implementation
        if (!query) return { data: mockTutors }
  
        const filtered = mockTutors.filter(
          (tutor) =>
            tutor.name.toLowerCase().includes(query.toLowerCase()) ||
            tutor.expertise.some((exp) => exp.toLowerCase().includes(query.toLowerCase())) ||
            tutor.bio.toLowerCase().includes(query.toLowerCase()),
        )
  
        return { data: filtered }
      },
    },
  
    // Sessions endpoints
    sessions: {
      getUpcomingSessions: async () => {
        await delay(600)
        return { data: mockUpcomingSessions }
      },
      getSessionHistory: async () => {
        await delay(600)
        return { data: mockSessionHistory }
      },
      getSessionById: async (id) => {
        await delay(500)
        const session = [...mockUpcomingSessions, ...mockSessionHistory].find((s) => s._id === id)
        if (!session) throw new Error("Session not found")
        return { data: session }
      },
      createSession: async (sessionData) => {
        await delay(1000)
        const newSession = {
          _id: `session${Date.now()}`,
          status: "pending",
          student: mockUser,
          ...sessionData,
        }
        return { data: newSession }
      },
      updateSession: async (id, updates) => {
        await delay(800)
        const session = [...mockUpcomingSessions, ...mockSessionHistory].find((s) => s._id === id)
        if (!session) throw new Error("Session not found")
  
        const updatedSession = { ...session, ...updates }
        return { data: updatedSession }
      },
    },
  
    // Courses endpoints
    courses: {
      getAllCourses: async () => {
        await delay(700)
        return { data: mockCourses }
      },
      getCourseById: async (id) => {
        await delay(500)
        const course = mockCourses.find((c) => c._id === id)
        if (!course) throw new Error("Course not found")
        return { data: course }
      },
      getStudentCourses: async () => {
        await delay(600)
        return { data: mockStudentCourses }
      },
      enrollInCourse: async (courseId) => {
        await delay(1000)
        const course = mockCourses.find((c) => c._id === courseId)
        if (!course) throw new Error("Course not found")
  
        const updatedCourse = {
          ...course,
          enrolledStudents: [...course.enrolledStudents, mockUser._id],
        }
        return { data: updatedCourse }
      },
    },
  }
  