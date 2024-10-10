const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Enrolled students
    assignments: [{ // Assignments uploaded by the teacher
        title: { type: String, required: true },
        description: String,
        dueDate: Date,
        submissions: [{ // Student submissions
            student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            fileUrl: String, // URL of the assignment submission
            grade: String
        }]
    }],
    quizzes: [{ // Quizzes created by the teacher
        title: { type: String, required: true },
        questions: [{
            question: String,
            options: [String],
            correctAnswer: String
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
