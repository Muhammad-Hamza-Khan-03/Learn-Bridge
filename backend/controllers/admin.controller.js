import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Tutor from '../models/Tutor.model.js';
import Session from '../models/Session.model.js';
import Message from '../models/Message.model.js';
import Review from '../models/Review.model.js';

// @desc    Get all users  
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const total = await User.countDocuments();

    const roleFilter = req.query.role ? { role: req.query.role } : {};

    const users = await User.find(roleFilter)
      .sort({ createdAt: -1 });




    res.status(200).json({
      success: true,
      count: users.length,

      total,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    let user;

    // Find user by ID
    const baseUser = await User.findById(req.params.id);

    if (!baseUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get role-specific user data
    if (baseUser.role === 'student') {
      user = await Student.findById(req.params.id);
    } else if (baseUser.role === 'tutor') {
      user = await Tutor.findById(req.params.id)
        .populate({
          path: 'reviews',
          select: 'rating comment createdAt student'
        });
    } else {
      user = baseUser;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Fields that admin can update
    const { name, email, role, country, bio, isActive } = req.body;

    // Create update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (role !== undefined) updateFields.role = role;
    if (country !== undefined) updateFields.country = country;
    if (bio !== undefined) updateFields.bio = bio;
    if (isActive !== undefined) updateFields.isActive = isActive;

    let updatedUser;

    // Update based on role
    if (user.role === 'student') {
      updatedUser = await Student.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      );
    } else if (user.role === 'tutor') {
      updatedUser = await Tutor.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      );
    } else if (user.role === 'admin') {
      updatedUser = await Admin.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    // Use findOneAndDelete to ensure it's properly deleted
    const deletedUser = await User.findOneAndDelete({ _id: req.params.id });
    console.log("Deleted user called from controller:", deletedUser);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // If this was a student, tutor, or admin, delete that record too
    if (deletedUser.role === 'student') {
      await Student.findOneAndDelete({ _id: req.params.id });
    } else if (deletedUser.role === 'tutor') {
      await Tutor.findOneAndDelete({ _id: req.params.id });
    } else if (deletedUser.role === 'admin') {
      await Admin.findOneAndDelete({ _id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server error deleting user'
    });
  }
};

// @desc    Get all sessions 
// @route   GET /api/admin/sessions
// @access  Private/Admin
export const getSessions = async (req, res) => {
  try {
    const total = await Session.countDocuments();

    // Filter by status if provided
    const statusFilter = req.query.status ? { status: req.query.status } : {};

    // Query with pagination
    const sessions = await Session.find(statusFilter)
      .populate({
        path: 'student',
        select: 'name email'
      })
      .populate({
        path: 'tutor',
        select: 'name email'
      })
      .sort({ date: -1 });



    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      data: sessions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTutors = await User.countDocuments({ role: 'tutor' });

    // Get session counts
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const pendingSessions = await Session.countDocuments({ status: 'pending' });
    const acceptedSessions = await Session.countDocuments({ status: 'accepted' });

    // Get message count
    const totalMessages = await Message.countDocuments();

    // Get review stats
    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get new sessions in last 30 days
    const newSessions = await Session.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get most popular subjects
    const popularSubjects = await Session.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          tutors: totalTutors,
          newLast30Days: newUsers
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          pending: pendingSessions,
          accepted: acceptedSessions,
          newLast30Days: newSessions
        },
        messages: {
          total: totalMessages
        },
        reviews: {
          total: totalReviews,
          averageRating: avgRating.length > 0 ? avgRating[0].averageRating : 0
        },
        popularSubjects
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


