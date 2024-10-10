const express = require('express');
const { createCourse, updateCourse, deleteCourse,enrollStudentInCourse,removeStudentFromCourse, countEnrolledStudents } = require('../controllers/courseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Admin routes
router.post('/courses', protect, authorizeRoles('admin'), createCourse);
router.put('/courses/:courseId', protect, authorizeRoles('admin'), updateCourse);
router.delete('/courses/:courseId', protect, authorizeRoles('admin'), deleteCourse);

// Admin: Enroll or remove a student from a course
router.post('/courses/:courseId/enroll/:studentId', protect, authorizeRoles('admin'), enrollStudentInCourse);
router.delete('/courses/:courseId/remove/:studentId', protect, authorizeRoles('admin'), removeStudentFromCourse);


// Admin/Teacher: Count number of enrolled students in a course
router.get('/courses/:courseId/student-count', protect, authorizeRoles('admin', 'teacher'), countEnrolledStudents);
module.exports = router;
