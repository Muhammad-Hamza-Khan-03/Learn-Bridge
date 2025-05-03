import Session from '../models/Session.model.js';
import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Tutor from '../models/Tutor.model.js';
import Course from '../models/Course.model.js';

// @desc    Create a new session request
// @route   POST /api/sessions
export const createSession = async (req, res) => {
  try {
    // Get user role from request
    const userRole = req.user.role;
    

    if (userRole === 'student') {
      // Add student id to request body
      req.body.student = req.user.id;
      
      // Check if tutor exists
      const tutor = await Tutor.findById(req.body.tutor);
      if (!tutor) {
        return res.status(404).json({
          success: false,
          error: 'Tutor not found'
        });
      }
      
      // Check if tutor teaches the requested subject
      if (!tutor.expertise.includes(req.body.subject)) {
        return res.status(400).json({
          success: false,
          error: `Tutor does not teach ${req.body.subject}`
        });
      }
      
    } else if (userRole === 'tutor') {
      // Add tutor id to request body
      req.body.tutor = req.user.id;
      
      // Check if student exists
      const student = await Student.findById(req.body.student);
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Only students and tutors can create session requests'
      });
    }
    if (req.body.course) {
      const course = await Course.findById(req.body.course);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }
      
      // If student is creating session, verify enrollment
      if (userRole === 'student') {
        const isEnrolled = course.enrolledStudents.some(
          student => student.toString() === req.user.id
        );
        if (!isEnrolled) {
          return res.status(403).json({
            success: false,
            error: 'You must be enrolled in this course to schedule a session'
          });
        }
      }
      
      // If tutor is creating session, verify ownership
      if (userRole === 'tutor' && course.tutor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only create sessions for courses you teach'
        });
      }
    }
    // Create session
    const session = await Session.create(req.body);

    // Add session to student's enrolledSessions
    await Student.findByIdAndUpdate(
      req.body.student,
      { $push: { enrolledSessions: session._id } }
    );

    // Add session to tutor's sessions
    await Tutor.findByIdAndUpdate(
      req.body.tutor,
      { $push: { sessions: session._id } }
    );

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (err) {
    console.error('Session creation error:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all sessions
// @route   GET /api/sessions
export const getSessions = async (req, res) => {
  try {
    let query;

    // If user is a student, get only their sessions
    if (req.user.role === 'student') {
      query = Session.find({ student: req.user.id });
    } 
    // If user is a tutor, get only their sessions
    else if (req.user.role === 'tutor') {
      query = Session.find({ tutor: req.user.id });
    } 
    // If user is an admin, get all sessions
    else if (req.user.role === 'admin') {
      query = Session.find();
    }

    // Add population
    query = query
      .populate({
        path: 'student',
        select: 'name email'
      })
      .populate({
        path: 'tutor',
        select: 'name email'
      });

    // Execute query
    const sessions = await query;

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: 'student',
        select: 'name email'
      })
      .populate({
        path: 'tutor',
        select: 'name email'
      })
      .populate({
        path: 'messages',
        select: 'sender content createdAt isRead'
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Make sure user is session owner or admin
    if (
      session.student._id.toString() !== req.user.id &&
      session.tutor._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this session'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update session status
// @route   PUT /api/sessions/:id
export const updateSessionStatus = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Make sure user is the tutor for this session
    if (session.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this session'
      });
    }

    // Check if status is valid
    const { status } = req.body;
    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    // Update session
    session = await Session.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'student',
        select: 'name email'
      })
      .populate({
        path: 'tutor',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Add meeting link to session
// @route   PUT /api/sessions/:id/meeting-link
export const addMeetingLink = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Make sure user is the tutor for this session
    if (session.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this session'
      });
    }

    // Check if meeting link is provided
    const { meetingLink } = req.body;
    if (!meetingLink) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a meeting link'
      });
    }

    // Update session
    session = await Session.findByIdAndUpdate(
      req.params.id,
      { meetingLink },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get upcoming sessions
// @route   GET /api/sessions/upcoming
export const getUpcomingSessions = async (req, res) => {
  try {
    console.log("Getting upcoming sessions for user:", req.user.id, "with role:", req.user.role);
    
    // Build the query based on user role
    let query;
    
    if (req.user.role === 'student') {
      query = {
        student: req.user.id
      };
    } else if (req.user.role === 'tutor') {
      query = {
        tutor: req.user.id
      };
    } else if (req.user.role === 'admin') {
      // Admins can see all sessions
      query = {};
    } else {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized role'
      });
    }
    
    // Use lean() for better performance 
    const sessions = await Session.find(query)
      .populate({
        path: 'student',
        select: 'name email', // Add any other fields you need
        model: 'Student'
      })
      .populate({
        path: 'tutor',
        select: 'name email expertise hourlyRate', // Add any other fields you need
        model: 'Tutor'
      })
      .sort('date startTime')
      .lean();
    
    console.log(`Found ${sessions.length} upcoming sessions`);
    
    // Log the first session for debugging if there are any
    if (sessions.length > 0) {
      console.log("Sample session:", {
        id: sessions[0]._id,
        subject: sessions[0].subject,
        hasStudent: !!sessions[0].student,
        hasTutor: !!sessions[0].tutor,
        studentType: sessions[0].student ? typeof sessions[0].student : 'none',
        tutorType: sessions[0].tutor ? typeof sessions[0].tutor : 'none'
      });
    }
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error("Error in getUpcomingSessions:", error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get session history
// @route   GET /api/sessions/history

export const getSessionHistory = async (req, res) => {
  try {
    console.log("Getting session history for user:", req.user.id, "with role:", req.user.role);
    
    // Build the query based on user role
    let query;
    const now = new Date();

    // If user is a student, get only their past sessions
    if (req.user.role === 'student') {
      query = {
        student: req.user.id,
        $or: [
          { date: { $lt: now } },
          { status: { $in: ['completed', 'cancelled', 'rejected'] } }
        ]
      };
    } 
    // If user is a tutor, get only their past sessions
    else if (req.user.role === 'tutor') {
      query = {
        tutor: req.user.id,
        $or: [
          { date: { $lt: now } },
          { status: { $in: ['completed', 'cancelled', 'rejected'] } }
        ]
      };
    } 
    // If user is an admin, get all past sessions
    else if (req.user.role === 'admin') {
      query = {
        $or: [
          { date: { $lt: now } },
          { status: { $in: ['completed', 'cancelled', 'rejected'] } }
        ]
      };
    } else {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized role'
      });
    }

    // Add population
    const sessions = await Session.find(query)
      .populate({
        path: 'student',
        select: 'name email',
        model: 'Student'
      })
      .populate({
        path: 'tutor',
        select: 'name email expertise hourlyRate',
        model: 'Tutor'
      })
      .sort({ date: -1 });

    console.log(`Found ${sessions.length} historical sessions`);
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    console.error("Error in getSessionHistory:", err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
