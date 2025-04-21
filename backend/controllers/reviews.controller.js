import Review from '../models/Review.model.js';
import Tutor from '../models/Tutor.model.js';
import Session from '../models/Session.model.js';

// @desc    Get reviews for a tutor
// @route   GET /api/reviews/tutor/:tutorId
// @access  Public
export const getTutorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tutor: req.params.tutorId })
      .populate({
        path: 'student',
        select: 'name profileImage'
      })
      .populate({
        path: 'session',
        select: 'subject date'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get reviews by a student
// @route   GET /api/reviews/student
// @access  Private/Student
export const getStudentReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ student: req.user.id })
      .populate({
        path: 'tutor',
        select: 'name profileImage'
      })
      .populate({
        path: 'session',
        select: 'subject date'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Check if student has already reviewed a session
// @route   GET /api/reviews/check/:sessionId
// @access  Private/Student
export const checkSessionReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      student: req.user.id,
      session: req.params.sessionId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'No review found for this session'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private/Student
export const createReview = async (req, res) => {
  try {
    const { session: sessionId, tutor: tutorId, rating, comment } = req.body;

    // Verify the session exists and is completed
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only review completed sessions'
      });
    }

    // Verify the student was part of the session
    if (session.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to review this session'
      });
    }

    // Check if student has already reviewed this session
    const existingReview = await Review.findOne({
      student: req.user.id,
      session: sessionId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this session'
      });
    }

    // Create review
    const review = await Review.create({
      student: req.user.id,
      tutor: tutorId,
      session: sessionId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private/Student
export const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to student
    if (review.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    // Update only allowed fields
    const { rating, comment } = req.body;
    
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Student
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to student or admin
    if (review.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};