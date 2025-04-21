import express from "express"
import {
  createSession,
  getSessions,
  getSession,
  updateSessionStatus,
  addMeetingLink,
  getUpcomingSessions,
  getSessionHistory
} from'../controllers/sessions.controller.js';

const SessionsRouter = express.Router();

// Import auth middleware
import { protect,authorize } from "../middlewares/auth.middleware.js";
// Apply auth middleware to all routes
SessionsRouter.use(protect);

// Session routes
SessionsRouter.post('/', authorize('student'), createSession);
SessionsRouter.get('/', getSessions);
SessionsRouter.get('/upcoming', getUpcomingSessions);
SessionsRouter.get('/history', getSessionHistory);
SessionsRouter.get('/:id', getSession);

SessionsRouter.put('/:id', authorize('tutor', 'admin'), updateSessionStatus);

SessionsRouter.put('/:id/meeting-link', authorize('tutor', 'admin'), addMeetingLink);

export default SessionsRouter
