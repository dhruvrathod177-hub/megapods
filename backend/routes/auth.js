const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")

const User = require("../models/User")

const otpStore = {}


/* ── REGISTER ── */
router.post("/register", async (req, res) => {
  try {
    const { fullName, contact, email, password } = req.body

    if (!fullName || !contact || !email || !password)
      return res.status(400).json({ message: "All fields are required" })

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = new User({
      fullName,
      contact,
      email,
      password: hashedPassword
    })

    await user.save()

    res.status(201).json({ message: "Account created successfully" })

  } catch (err) {
    console.error("REGISTER ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})


/* ── LOGIN ── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" })

    const user = await User.findOne({ email })

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" })

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" })

    const token = jwt.sign(
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        contact: user.contact
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        contact: user.contact
      }
    })

  } catch (err) {
    console.error("LOGIN ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})


/* ── FORGOT PASSWORD (EMAIL OTP) ── */
router.post("/forgot-password", async (req, res) => {
  try {

    const { email } = req.body

    if (!email)
      return res.status(400).json({ message: "Email is required" })

    const user = await User.findOne({ email })

    if (!user)
      return res.status(400).json({ message: "No account found with this email" })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: `"Megapods Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Megapods Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `
    })

    res.json({ message: "OTP sent to your email" })

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err)
    res.status(500).json({ message: "Failed to send OTP" })
  }
})


/* ── VERIFY OTP ── */
router.post("/verify-otp", async (req, res) => {
  try {

    const { email, otp } = req.body

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" })

    const record = otpStore[email]

    if (!record)
      return res.status(400).json({ message: "No OTP requested for this email" })

    if (Date.now() > record.expiresAt) {
      delete otpStore[email]
      return res.status(400).json({ message: "OTP expired" })
    }

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" })

    res.json({ message: "OTP verified successfully" })

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})


/* ── RESET PASSWORD ── */
router.post("/reset-password", async (req, res) => {
  try {

    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields are required" })

    const record = otpStore[email]

    if (!record)
      return res.status(400).json({ message: "No OTP requested for this email" })

    if (Date.now() > record.expiresAt) {
      delete otpStore[email]
      return res.status(400).json({ message: "OTP expired. Request a new one." })
    }

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" })

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    )

    delete otpStore[email]

    res.json({ message: "Password reset successfully" })

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})


module.exports = router