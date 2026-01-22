require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const roleRoutes = require('./routes/roles');
const courseRoutes = require('./routes/course');
const lectureRoutes = require('./routes/lecture');
const progressRoutes = require('./routes/progress');
const watchTimeRoutes = require('./routes/watchTime');
const testRoutes = require('./routes/test');
const assignmentRoutes = require('./routes/assignment'); 


const app = express();

// DB connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'LMS API Server' });
});


app.use('/api/auth', authRoutes);

app.use('/api/test', protectedRoutes);

app.use('/api/role', roleRoutes);

app.use('/api/course', courseRoutes);

app.use('/api/lecture', lectureRoutes);

app.use('/api/progress', progressRoutes);

app.use('/api/watch-time', watchTimeRoutes);

app.use('/api/test', testRoutes);

app.use('/api/assignment', assignmentRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});