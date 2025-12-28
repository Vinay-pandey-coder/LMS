const express = require('express')
const User = require('../model/usermodel')

const router = express.Router()

router.post('/register',async(req,res)=>{
  try {
    const {name , email , password , role} = req.body

    if (!name || !email || ! password || !role) {
      return res.status(400).json({message:"Please provide name,email and password"})
    }

    const exitingUser = await User.findOne({email})
    if (exitingUser) {
      return res.status(400).json({message:"User already exists"})
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || "student"
    })

    await newUser.save()
    
  } catch (error) {
    console.log(error)
  }
})