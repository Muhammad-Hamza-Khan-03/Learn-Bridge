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
Coursesrouter.post('/',  createCourse);
Coursesrouter.put('/:id', updateCourse);
Coursesrouter.delete('/:id', deleteCourse);

// Student routes
Coursesrouter.put('/:id/enroll',  enrollCourse);
Coursesrouter.put('/:id/unenroll', unenrollCourse);
Coursesrouter.get('/student/enrolled', getStudentCourses);

// Tutor routes
Coursesrouter.get('/tutor/mycourses', protect, authorize('tutor'), getTutorCourses);

Coursesrouter.get('/tutor/mycourses', getTutorCourses);

export default Coursesrouter;
