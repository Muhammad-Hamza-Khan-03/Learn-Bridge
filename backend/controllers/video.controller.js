// backend/controllers/video.controller.js
import axios from 'axios';
import Session from '../models/Session.model.js';

/**
 * Generate a token for joining 100ms video rooms
 * @route   POST /api/video/token
 * @access  Private
 */
export const generateToken = async (req, res) => {
  try {
    const { sessionId, role, userId, name } = req.body;

    // Validate request
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Verify the session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Make sure user is part of the session (either tutor or student)
    const isAuthorized = 
      (req.user.role === 'tutor' && session.tutor.toString() === req.user.id) ||
      (req.user.role === 'student' && session.student.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to join this session'
      });
    }

    // Create unique room ID for the session
    const roomId = `learn-bridge-session-${sessionId}`;

    // Calculate expiry (24 hours from now)
    const expiresIn = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    // In a real implementation, you would use the 100ms SDK to generate a token
    // For now, we're using a placeholder implementation
    const generateHMSToken = async (roomId, role, userId, name) => {
      try {
        // This assumes you have 100ms credentials set in your environment variables
        const HMS_APP_ACCESS_KEY = process.env.HMS_APP_ACCESS_KEY;
        const HMS_APP_SECRET = process.env.HMS_APP_SECRET;
        
        if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET) {
          throw new Error('100ms credentials not configured');
        }
        
        const options = {
          method: 'POST',
          url: 'https://api.100ms.live/v2/token',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HMS_APP_ACCESS_KEY}`
          },
          data: {
            room_id: roomId,
            user_id: userId,
            role: role === 'tutor' ? 'host' : 'guest',
            type: 'app',
            expires: expiresIn.toString()
          }
        };
        
        const response = await axios(options);
        return response.data.token;
      } catch (error) {
        console.error('Error generating HMS token:', error);
        
        // If 100ms API is not configured, return a mock token for development
        if (!process.env.HMS_APP_ACCESS_KEY || !process.env.HMS_APP_SECRET) {
          console.log('Using mock 100ms token for development');
          return 'mock-hms-token-for-development-only';
        }
        
        throw error;
      }
    };

    // Generate the token
    const token = await generateHMSToken(
      roomId,
      role,
      userId,
      name
    );

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    console.error('Error generating video token:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  }
};