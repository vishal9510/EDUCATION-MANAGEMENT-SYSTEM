const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadAssignment,createQuiz } = require('../controllers/courseController');
const { assignGrade, calculateAverageGrade } = require('../controllers/teacherController');


const router = express.Router();

// Teacher-only route (e.g., managing courses)
router.get('/teacher-dashboard', protect, authorizeRoles('teacher'), (req, res) => {
    res.json({ message: 'Welcome to the teacher dashboard' });
});

// Teacher routes
router.post('/courses/:courseId/assignments', protect, authorizeRoles('teacher'), uploadAssignment);
router.post('/courses/:courseId/quizzes', protect, authorizeRoles('teacher'), createQuiz);

// Teacher: Assign grade to a student's submission
router.put('/courses/:courseId/assignments/:assignmentId/grade/:studentId', protect, authorizeRoles('teacher'), assignGrade);

// Teacher: Calculate average grade for a course
router.get('/courses/:courseId/average-grade', protect, authorizeRoles('teacher'), calculateAverageGrade);
module.exports = router;
