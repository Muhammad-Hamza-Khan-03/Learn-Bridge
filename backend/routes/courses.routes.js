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
// const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
Coursesrouter.get('/', getCourses);
Coursesrouter.get('/:id', getCourse);

// Protected routes
// router.post('/', protect, authorize('tutor'), createCourse);
// router.put('/:id', protect, authorize('tutor', 'admin'), updateCourse);
// router.delete('/:id', protect, authorize('tutor', 'admin'), deleteCourse);

Coursesrouter.post('/',  createCourse);
Coursesrouter.put('/:id', updateCourse);
Coursesrouter.delete('/:id', deleteCourse);

// Student routes
// router.put('/:id/enroll', protect, authorize('student'), enrollCourse);
// router.put('/:id/unenroll', protect, authorize('student'), unenrollCourse);
// router.get('/student/enrolled', protect, authorize('student'), getStudentCourses);

Coursesrouter.put('/:id/enroll',  enrollCourse);
Coursesrouter.put('/:id/unenroll', unenrollCourse);
Coursesrouter.get('/student/enrolled', getStudentCourses);

// Tutor routes
// router.get('/tutor/mycourses', protect, authorize('tutor'), getTutorCourses);

Coursesrouter.get('/tutor/mycourses', getTutorCourses);

export default Coursesrouter;
