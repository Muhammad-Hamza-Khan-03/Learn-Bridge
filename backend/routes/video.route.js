// backend/routes/video.routes.js
import express from "express";
import { generateToken } from "../controllers/video.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const videoRouter = express.Router();

// Apply auth middleware to all routes
videoRouter.use(protect);

// Routes
videoRouter.post('/token', generateToken);

export default videoRouter;