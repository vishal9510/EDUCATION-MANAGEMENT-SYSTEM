const Course = require('../model/course.model');

// Teacher: Assign grades to a student's submission
const assignGrade = async (req, res) => {
    try {
        const { courseId, assignmentId, studentId } = req.params;
        const { grade } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to assign grades for this course" });
        }

        const assignment = course.assignments.id(assignmentId);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        const submission = assignment.submissions.find(sub => sub.student.toString() === studentId);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.grade = grade;
        await course.save();

        res.json({ message: "Grade assigned successfully", course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Teacher: Calculate the average grade for a course
const calculateAverageGrade = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to access this course" });
        }

        // Aggregation pipeline to calculate average grade
        const result = await Course.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(courseId) } }, // Filter the course by ID
            { $unwind: "$assignments" }, // Unwind assignments array
            { $unwind: "$assignments.submissions" }, // Unwind submissions array
            {
                $match: { "assignments.submissions.grade": { $ne: null } } // Filter only graded submissions
            },
            {
                $group: {
                    _id: "$_id", // Group by course ID
                    averageGrade: { $avg: { $toDouble: "$assignments.submissions.grade" } } // Calculate the average grade
                }
            }
        ]);

        if (!result.length) {
            return res.json({ message: "No grades available for this course" });
        }

        res.json({ courseId, averageGrade: result[0].averageGrade.toFixed(2) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



module.exports = { assignGrade, calculateAverageGrade };