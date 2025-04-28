import express from 'express'
import {
  getUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getSessions,
  getPlatformStats
} from '../controllers/admin.controller.js';

const AdminRouter = express.Router();

// Import auth middleware
import { protect, authorize } from '../middlewares/auth.middleware.js';

// Apply auth middleware to all routes
AdminRouter.use(protect);
AdminRouter.use(authorize('admin'));

// Admin routes
AdminRouter.get('/users', getUsers);
AdminRouter.get('/users/:id', getUserDetails);
AdminRouter.put('/users/:id', updateUser);
AdminRouter.delete('/users/:id', deleteUser);
AdminRouter.get('/sessions', getSessions);
AdminRouter.get('/stats', getPlatformStats);

export default AdminRouter
