require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')


const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

connectDB()

const app = express()
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);
app.use(express.json())

app.get('/',(req,res)=>{
  res.json({message:"LMS API SERVER"})
})

app.use('/api/auth', authRoutes);
app.use('/api/test', protectedRoutes);

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
  console.log(`http://localhost:${PORT}`)
})