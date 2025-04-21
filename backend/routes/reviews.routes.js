import express from "express";
import {
  getTutorReviews,
  getStudentReviews,
  checkSessionReview,
  createReview,
  updateReview,
  deleteReview
} from "../controllers/reviews.controller.js";

// Import auth middleware
import { protect, authorize } from "../middlewares/auth.middleware.js";

const reviewRouter = express.Router();

// Public routes
reviewRouter.get('/tutor/:tutorId', getTutorReviews);

// Protected routes
reviewRouter.use(protect);

// Student routes
reviewRouter.get('/student', authorize('student'), getStudentReviews);
reviewRouter.get('/check/:sessionId', authorize('student'), checkSessionReview);
reviewRouter.post('/', authorize('student'), createReview);
reviewRouter.put('/:id', authorize('student'), updateReview);
reviewRouter.delete('/:id', authorize('student', 'admin'), deleteReview);

export default reviewRouter;