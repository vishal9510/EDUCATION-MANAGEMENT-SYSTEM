const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');


// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());



// Import Routes
const router = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoute = require('./routes/studentRoutes');



// Use Routes
app.use('/api/auth', router);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoute);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);





// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

