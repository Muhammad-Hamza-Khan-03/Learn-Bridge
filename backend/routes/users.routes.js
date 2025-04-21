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


const userRouter = express.Router()

// todo: protect


// Admin routes todo: uncomment
// router.get('/', protect, authorize('admin'), getUsers);
// router.get('/:id', protect, authorize('admin'), getUser);

userRouter.get('/', getUsers);
userRouter.get('/:id', getUser);

// Profile routes
// router.put('/profile', protect, updateProfile);
userRouter.put('/profile', updateProfile);

// Tutor routes
userRouter.get('/tutors/search', searchTutors);
userRouter.get('/tutors/:id', getTutorProfile);
// router.put('/tutors/availability', protect, authorize('tutor'), updateTutorAvailability);
userRouter.put('/tutors/availability', updateTutorAvailability);

// Student routes
// router.put('/students/learning-goals', protect, authorize('student'), updateLearningGoals);
userRouter.put('/students/learning-goals', updateLearningGoals);
userRouter.get('/students/search', searchStudents);
userRouter.get('/students/:id', getStudentProfile);
export default userRouter