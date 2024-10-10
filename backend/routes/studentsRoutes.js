const express = require('express');
const { getStudentProgress ,viewEnrollmentStatus, updateSubmission, deleteSubmission,viewGrades} = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { enrollInCourse, submitAssignment, } = require('../controllers/courseController');

const router = express.Router();

router.get('/progress', authorizeRoles(['student']), getStudentProgress);

// Student routes
router.post('/courses/:courseId/enroll', protect, authorizeRoles('student'), enrollInCourse);
router.post('/courses/:courseId/assignments/:assignmentId/submit', protect, authorizeRoles('student'), submitAssignment);

// Student: View enrollment status
router.get('/courses/enrollment-status', protect, authorizeRoles('student'), viewEnrollmentStatus);

// Student: Update or delete submission
router.put('/courses/:courseId/assignments/:assignmentId/update', protect, authorizeRoles('student'), updateSubmission);
router.delete('/courses/:courseId/assignments/:assignmentId/delete', protect, authorizeRoles('student'), deleteSubmission);

// Student: View grades for each course
router.get('/courses/grades', protect, authorizeRoles('student'), viewGrades);
module.exports = router;
