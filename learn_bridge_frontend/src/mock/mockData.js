// Mock data for the tutoring platform

// Mock User Data
export const mockUser = {
    _id: "user123",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "student",
    profileImage: "/placeholder.svg?height=100&width=100",
  }
  
  // Mock Tutors Data
  export const mockTutors = [
    {
      _id: "tutor1",
      name: "Dr. Sarah Williams",
      email: "sarah@example.com",
      expertise: ["Mathematics", "Physics", "Calculus"],
      bio: "Experienced mathematics professor with 10+ years of teaching experience at university level. Specializes in calculus and differential equations.",
      experience: 10,
      education: "Ph.D. in Mathematics, Stanford University",
      hourlyRate: 75,
      country: "United States",
      averageRating: 4.8,
      totalReviews: 124,
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00" },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
        { day: "Friday", startTime: "09:00", endTime: "17:00" },
      ],
    },
    {
      _id: "tutor2",
      name: "Prof. Michael Chen",
      email: "michael@example.com",
      expertise: ["Physics", "Engineering", "Computer Science"],
      bio: "Former NASA engineer with a passion for teaching physics and engineering concepts. Practical approach to complex topics.",
      experience: 15,
      education: "Ph.D. in Physics, MIT",
      hourlyRate: 85,
      country: "Canada",
      averageRating: 4.6,
      totalReviews: 98,
      availability: [
        { day: "Tuesday", startTime: "10:00", endTime: "18:00" },
        { day: "Thursday", startTime: "10:00", endTime: "18:00" },
        { day: "Saturday", startTime: "12:00", endTime: "16:00" },
      ],
    },
    {
      _id: "tutor3",
      name: "Dr. Emily Johnson",
      email: "emily@example.com",
      expertise: ["English Literature", "Creative Writing", "Grammar"],
      bio: "Published author and English professor specializing in literature analysis and creative writing. Helps students find their unique voice.",
      experience: 8,
      education: "Ph.D. in English Literature, Oxford University",
      hourlyRate: 65,
      country: "United Kingdom",
      averageRating: 4.9,
      totalReviews: 156,
      availability: [
        { day: "Monday", startTime: "12:00", endTime: "20:00" },
        { day: "Wednesday", startTime: "12:00", endTime: "20:00" },
        { day: "Friday", startTime: "12:00", endTime: "20:00" },
      ],
    },
  ]
  
  // Mock Courses Data
  export const mockCourses = [
    {
      _id: "course1",
      title: "Advanced Calculus",
      description:
        "Comprehensive course covering differential and integral calculus, series, and multivariate calculus. Ideal for engineering and physics students.",
      subject: "Mathematics",
      level: "Advanced",
      duration: 12,
      startDate: "2025-05-15",
      endDate: "2025-08-07",
      price: 499,
      maxStudents: 20,
      enrolledStudents: ["user123", "user456"],
      tutor: mockTutors[0],
      timings: [
        { day: "Monday", startTime: "10:00", endTime: "12:00" },
        { day: "Wednesday", startTime: "10:00", endTime: "12:00" },
      ],
    },
    {
      _id: "course2",
      title: "Quantum Physics Fundamentals",
      description:
        "Introduction to quantum mechanics, wave functions, and the Schrödinger equation. Includes practical applications and problem-solving sessions.",
      subject: "Physics",
      level: "Intermediate",
      duration: 10,
      startDate: "2025-06-01",
      endDate: "2025-08-10",
      price: 599,
      maxStudents: 15,
      enrolledStudents: [],
      tutor: mockTutors[1],
      timings: [
        { day: "Tuesday", startTime: "14:00", endTime: "16:00" },
        { day: "Thursday", startTime: "14:00", endTime: "16:00" },
      ],
    },
    {
      _id: "course3",
      title: "Creative Writing Workshop",
      description:
        "Develop your creative writing skills through guided exercises, peer feedback, and professional critique. Covers fiction, poetry, and creative non-fiction.",
      subject: "English Literature",
      level: "Beginner",
      duration: 8,
      startDate: "2025-05-20",
      endDate: "2025-07-15",
      price: 349,
      maxStudents: 12,
      enrolledStudents: ["user789"],
      tutor: mockTutors[2],
      timings: [
        { day: "Monday", startTime: "18:00", endTime: "20:00" },
        { day: "Friday", startTime: "18:00", endTime: "20:00" },
      ],
    },
  ]
  
  // Mock Sessions Data
  export const mockUpcomingSessions = [
    {
      _id: "session1",
      subject: "Calculus Help",
      date: "2025-05-10",
      startTime: "14:00",
      endTime: "15:30",
      status: "accepted",
      notes: "Need help with integration by parts",
      tutor: mockTutors[0],
      student: mockUser,
      meetingLink: "https://meet.example.com/session1",
    },
    {
      _id: "session2",
      subject: "Physics Problem Set Review",
      date: "2025-05-12",
      startTime: "16:00",
      endTime: "17:30",
      status: "pending",
      notes: "Would like to go over last week's problem set",
      tutor: mockTutors[1],
      student: mockUser,
    },
  ]
  
  export const mockSessionHistory = [
    {
      _id: "session3",
      subject: "Essay Review",
      date: "2025-04-28",
      startTime: "18:00",
      endTime: "19:00",
      status: "completed",
      notes: "Reviewed my Shakespeare essay",
      tutor: mockTutors[2],
      student: mockUser,
    },
    {
      _id: "session4",
      subject: "Math Exam Prep",
      date: "2025-04-25",
      startTime: "15:00",
      endTime: "16:30",
      status: "completed",
      notes: "Prepared for midterm exam",
      tutor: mockTutors[0],
      student: mockUser,
    },
    {
      _id: "session5",
      subject: "Physics Concepts",
      date: "2025-04-20",
      startTime: "10:00",
      endTime: "11:30",
      status: "cancelled",
      notes: "Had to cancel due to illness",
      tutor: mockTutors[1],
      student: mockUser,
    },
  ]
  
  // Mock Student Courses (enrolled courses)
  export const mockStudentCourses = [mockCourses[0]]
  