require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')


const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const courseRoutes = require('./routes/course');
const lectureRoutes = require('./routes/lecture');
const roleRoutes = require('./routes/roles');
const progressRoutes = require('./routes/progress');

connectDB()

const app = express()
app.use(cors());
app.use(express.json())



app.get('/',(req,res)=>{
  res.json({message:"LMS API SERVER"})
})

app.use('/api/auth', authRoutes);
app.use('/api/test', protectedRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/lecture',lectureRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/progress', progressRoutes);



const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
  console.log(`http://localhost:${PORT}`)
})