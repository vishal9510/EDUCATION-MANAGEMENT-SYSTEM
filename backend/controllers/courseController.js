const Course = require('../model/course.model');
const User = require('../model/user.model');

// Admin: Create a new course
const createCourse = async (req, res) => {
    try {
        const { title, description, teacherId } = req.body;
        const course = new Course({ title, description, teacher: teacherId });
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Update a course
const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId, { title, description }, { new: true }
        );
        if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
        res.json(updatedCourse);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Delete a course
const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        if (!deletedCourse) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Student: Enroll in a course
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ message: "Course not found" });
        if (course.students.includes(req.user.id)) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        course.students.push(req.user.id);
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Student: Submit assignment
const submitAssignment = async (req, res) => {
    try {
        const { courseId, assignmentId } = req.params;
        const { fileUrl } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const assignment = course.assignments.id(assignmentId);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        const alreadySubmitted = assignment.submissions.some(sub => sub.student.toString() === req.user.id);
        if (alreadySubmitted) {
            return res.status(400).json({ message: "Already submitted the assignment" });
        }

        assignment.submissions.push({ student: req.user.id, fileUrl });
        await course.save();

        res.json({ message: "Assignment submitted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Teacher: Upload assignment for a course
const uploadAssignment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, dueDate } = req.body;
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ message: "Course not found" });
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to upload assignments for this course" });
        }

        const newAssignment = { title, description, dueDate };
        course.assignments.push(newAssignment);
        await course.save();

        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Teacher: Create quiz for a course
const createQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, questions } = req.body;
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ message: "Course not found" });
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to create quizzes for this course" });
        }

        const newQuiz = { title, questions };
        course.quizzes.push(newQuiz);
        await course.save();

        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Enroll a student in a course
const enrollStudentInCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });
        if (student.role !== 'student') {
            return res.status(400).json({ message: "Only students can be enrolled in courses" });
        }

        if (course.students.includes(studentId)) {
            return res.status(400).json({ message: "Student is already enrolled in this course" });
        }

        course.students.push(studentId);
        await course.save();

        res.json({ message: "Student enrolled successfully", course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Remove a student from a course
const removeStudentFromCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        if (!course.students.includes(studentId)) {
            return res.status(400).json({ message: "Student is not enrolled in this course" });
        }

        course.students = course.students.filter(id => id.toString() !== studentId.toString());
        await course.save();

        res.json({ message: "Student removed from course successfully", course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Admin/Teacher: Count the number of enrolled students
const countEnrolledStudents = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Aggregation pipeline to count enrolled students
        const result = await Course.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(courseId) } }, // Filter the course by ID
            {
                $project: {
                    studentCount: { $size: "$students" } // Count the number of students in the 'students' array
                }
            }
        ]);

        res.json({ courseId, studentCount: result[0].studentCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createCourse, updateCourse, deleteCourse, enrollInCourse, submitAssignment, uploadAssignment, createQuiz, enrollStudentInCourse, removeStudentFromCourse, countEnrolledStudents };