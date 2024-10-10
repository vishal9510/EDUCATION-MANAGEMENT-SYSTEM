const Progress = require('../model/progress.model');
const Course = require('../model/course.model');

const getStudentProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ student: req.user.id }).populate('course', 'title');
        res.json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// Student: View enrollment status in courses
const viewEnrollmentStatus = async (req, res) => {
    try {
        const studentId = req.user.id;
        const courses = await Course.find({ students: studentId });

        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Student: Update assignment submission
const updateSubmission = async (req, res) => {
    try {
        const { courseId, assignmentId } = req.params;
        const { fileUrl } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const assignment = course.assignments.id(assignmentId);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        const submissionIndex = assignment.submissions.findIndex(sub => sub.student.toString() === req.user.id);
        if (submissionIndex === -1) {
            return res.status(404).json({ message: "Submission not found" });
        }

        // Update the existing submission
        assignment.submissions[submissionIndex].fileUrl = fileUrl;
        await course.save();

        res.json({ message: "Submission updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Student: Delete assignment submission
const deleteSubmission = async (req, res) => {
    try {
        const { courseId, assignmentId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const assignment = course.assignments.id(assignmentId);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        const submissionIndex = assignment.submissions.findIndex(sub => sub.student.toString() === req.user.id);
        if (submissionIndex === -1) {
            return res.status(404).json({ message: "Submission not found" });
        }

        // Remove the submission
        assignment.submissions.splice(submissionIndex, 1);
        await course.save();

        res.json({ message: "Submission deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Student: View grades for a course
const viewGrades = async (req, res) => {
    try {
        const studentId = req.user.id;
        const courses = await Course.find({ students: studentId });

        const grades = courses.map(course => ({
            courseId: course._id,
            courseTitle: course.title,
            assignments: course.assignments.map(assignment => {
                const submission = assignment.submissions.find(sub => sub.student.toString() === studentId);
                return {
                    assignmentTitle: assignment.title,
                    grade: submission ? submission.grade : "Not graded"
                };
            })
        }));

        res.json(grades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getStudentProgress,
    viewEnrollmentStatus,
    updateSubmission,
    deleteSubmission,
    viewGrades
};
