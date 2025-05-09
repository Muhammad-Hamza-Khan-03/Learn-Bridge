import Course from '../models/Course.model.js';
import Tutor from '../models/Tutor.model.js';
import Student from '../models/Student.model.js';


// @desc    Create a new course
// @route   POST /api/courses
export const createCourse = async (req, res, next) => {
    try {
      // Check if user is a tutor
      if (req.user.role !== 'tutor') {
        return next(new Error('Only tutors can create courses', 403));
      }
  
      // Add tutor id to request body
      req.body.tutor = req.user.id;
  
      // Create course
      const course = await Course.create(req.body);
  
      // Add course to tutor's courses
      await Tutor.findByIdAndUpdate(
        req.user.id,
        { $push: { courses: course._id } }
      );
  
      res.status(201).json({
        success: true,
        data: course
      });
    } catch (err) {
      next(err);
    }
  };
  
  // @desc    Get all courses
  // @route   GET /api/courses
  export const getCourses = async (req, res, next) => {
    try {
      // Copy req.query
      const reqQuery = { ...req.query };
  
      // Fields to exclude
      const removeFields = ['select', 'sort', 'page', 'limit'];
  
      // Loop over removeFields and delete them from reqQuery
      removeFields.forEach(param => delete reqQuery[param]);
  
      // Create query string
      let queryStr = JSON.stringify(reqQuery);
  
      // Create operators ($gt, $gte, etc)
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
      // Finding resource
      let query = Course.find(JSON.parse(queryStr))
        .populate({
          path: 'tutor',
          select: 'name averageRating totalReviews'
        });
  
      // Select Fields
      if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
      }
  
      // Sort
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }
  
      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const total = await Course.countDocuments(JSON.parse(queryStr));
  
      query = query.skip(startIndex).limit(limit);
  
      // Executing query
      const courses = await query;
  
      // Pagination result
      const pagination = {};
  
      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit
        };
      }
  
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit
        };
      }
  
      res.status(200).json({
        success: true,
        count: courses.length,
        pagination,
        data: courses
      });
    } catch (err) {
      next(err);
    }
  };
  
  // @desc    Get single course
  // @route   GET /api/courses/:id
  export const getCourse = async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate({
          path: 'tutor',
          select: 'name averageRating totalReviews'
        })
        .populate({
          path: 'enrolledStudents',
          select: 'name'
        });
  
      if (!course) {
        return next(new Error(`Course not found with id of ${req.params.id}`, 404));
      }
  
      res.status(200).json({
        success: true,
        data: course
      });
    } catch (err) {
      next(err);
    }
  };
  
  // @desc    Update course
  // @route   PUT /api/courses/:id
  export const updateCourse = async (req, res, next) => {
    try {
      let course = await Course.findById(req.params.id);
  
      if (!course) {
        return next(new Error(`Course not found with id of ${req.params.id}`, 404));
      }
  
      // Make sure user is course owner
      if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error(`User ${req.user.id} is not authorized to update this course`, 401));
      }
  
      course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
  
      res.status(200).json({
        success: true,
        data: course
      });
    } catch (err) {
      next(err);
    }
  };
  
  // @desc    Delete course
  // @route   DELETE /api/courses/:id
 export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course not found with id of ${req.params.id}`
      });
    }

    // Make sure user is course owner
    if (course.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to delete this course`
      });
    }

    // Use findByIdAndDelete instead of remove()
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
  
//   @desc    Enroll in course
//   @route   PUT /api/courses/:id/enroll
  export const enrollCourse = async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.id);
  
      if (!course) {
        return next(new Error(`Course not found with id of ${req.params.id}`, 404));
      }
  
      // Check if user is a student
      if (req.user.role !== 'student') {
        return next(new Error('Only students can enroll in courses', 403));
      }
  
      // Check if course is active
      if (!course.isActive) {
        return next(new Error('Cannot enroll in inactive course', 400));
      }
  
      // Check if course is full
      if (course.enrolledStudents.length >= course.maxStudents) {
        return next(new Error('Course is full', 400));
      }
  
      // Check if student is already enrolled
      if (course.enrolledStudents.includes(req.user.id)) {
        return next(new Error('Student already enrolled in this course', 400));
      }
  
      // Add student to course
      course.enrolledStudents.push(req.user.id);
      await course.save();
  
      // Add course to student's enrolledCourses
      await Student.findByIdAndUpdate(
        req.user.id,
        { $push: { enrolledCourses: course._id } }
      );
  
      res.status(200).json({
        success: true,
        data: course
      });
    } catch (err) {
      next(err);
    }
  };
  // @desc    Unenroll from course
  // @route   PUT /api/courses/:id/unenroll
  export const unenrollCourse = async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
  
      if (!course) {
        return res.status(404).json({
          success: false,
          error: `Course not found with id of ${req.params.id}`
        });
      }
  
      // Check if user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({
          success: false,
          error: 'Only students can unenroll from courses'
        });
      }
  
      // Check if student is enrolled - needs to convert ObjectIds to strings for comparison
      const studentId = req.user.id;
      const isEnrolled = course.enrolledStudents.some(
        student => student.toString() === studentId
      );
  
      if (!isEnrolled) {
        return res.status(400).json({
          success: false,
          error: 'Student not enrolled in this course'
        });
      }
  
      // Remove student from course
      course.enrolledStudents = course.enrolledStudents.filter(
        student => student.toString() !== studentId
      );
      await course.save();
  
      // Remove course from student's enrolledCourses
      await Student.findByIdAndUpdate(
        studentId,
        { $pull: { enrolledCourses: course._id } }
      );
  
      res.status(200).json({
        success: true,
        data: course
      });
    } catch (err) {
      console.error('Error in unenrollCourse:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Server Error'
      });
    }
  };
  
  // @desc    Get courses for a tutor
  // @route   GET /api/courses/tutor
  export const getTutorCourses = async (req, res) => {
    try {
      // Use selective field projection and limit records
      const courses = await Course.find({ tutor: req.user.id })
  .populate({
    path: 'tutor',
    select: 'name profileImage'
  })
  .select('title subject level maxStudents enrolledStudents isActive startDate endDate')
  .sort('-createdAt');
      
      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  };
  
  // @desc    Get enrolled courses for a student
  // @route   GET /api/courses/student/enrolled
  export const getStudentCourses = async (req, res, next) => {
    try {
      // Check if user is a student
      if (req.user.role !== 'student') {
        return next(new Error('Only students can access their enrolled courses', 403));
      }
  
      const courses = await Course.find({ enrolledStudents: req.user.id })
        .populate({
          path: 'tutor',
          select: 'name averageRating totalReviews'
        });
  
      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (err) {
      next(err);
    }
  };
  