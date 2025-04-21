import express from "express"
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  getTutorCourses,
  getStudentCourses
} from '../controllers/courses.controller.js'

const Coursesrouter = express.Router();

// Import auth middleware
import { protect,authorize } from "../middlewares/auth.middleware.js";
// Public routes
Coursesrouter.get('/', getCourses);
Coursesrouter.get('/:id', getCourse);

// Protected routes
Coursesrouter.post('/', protect, authorize('tutor') ,createCourse);
Coursesrouter.put('/:id', protect, authorize('tutor'), updateCourse);
Coursesrouter.delete('/:id', protect, authorize('tutor'), deleteCourse);

// Student routes
Coursesrouter.put('/:id/enroll', protect, authorize('student'),  enrollCourse);
Coursesrouter.put('/:id/unenroll',protect, authorize('student'), unenrollCourse);
Coursesrouter.get('/student/enrolled', protect, authorize('student'), getStudentCourses);

// Tutor routes
Coursesrouter.get('/tutor/mycourses', protect, authorize('tutor'), getTutorCourses);


export default Coursesrouter;
