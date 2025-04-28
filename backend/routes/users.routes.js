import express from "express"
import {getUsers,
    getUser,
    updateProfile,
    searchTutors,
    getTutorProfile,
    updateTutorAvailability,
    updateLearningGoals,
    searchStudents,
    getStudentProfile}
    from "../controllers/users.controller.js"

import { protect,authorize } from "../middlewares/auth.middleware.js";

const userRouter = express.Router()

userRouter.get('/', protect, authorize('admin'), getUsers);
userRouter.get('/:id', protect, authorize('admin'), getUser);


// Profile routes
userRouter.put('/profile', protect, updateProfile);

// Tutor routes
userRouter.get('/tutors/search', searchTutors);
userRouter.get('/tutors/:id', getTutorProfile);
userRouter.put('/tutors/availability', protect, authorize('tutor'), updateTutorAvailability);

// Student routes
userRouter.put('/students/learning-goals', protect, authorize('student'), updateLearningGoals);

userRouter.get('/students/search', searchStudents);
userRouter.get('/students/:id', getStudentProfile);
export default userRouter