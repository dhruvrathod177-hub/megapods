require("dotenv").config()

const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))
const User = require("../models/User")

const otpStore = {}

/* ── SEND OTP EMAIL ── */
async function sendOTPEmail(toEmail, toName, otp) {
  try {

    console.log("BREVO API KEY:", process.env.BREVO_API_KEY)

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Megapodsindia",
          email: "dhruvrathod177@gmail.com",
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject: "Your Password Reset OTP - Megapodsindia",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #ea580c; margin: 0;">Megapodsindia</h2>
            <p style="color: #6b7280; margin: 4px 0;">Password Reset Request</p>
          </div>

          <p style="color: #374151;">Hello <strong>${toName}</strong>,</p>
          <p style="color: #374151;">We received a request to reset your password. Use the OTP below:</p>

          <div style="background: #fff7ed; border: 2px solid #ea580c; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 13px;">Your OTP</p>
            <p style="margin: 8px 0 0; font-size: 42px; font-weight: bold; color: #ea580c; letter-spacing: 8px;">${otp}</p>
          </div>

          <p style="color: #6b7280; font-size: 13px;">⏱ This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 13px;">If you didn't request this, please ignore this email.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © 2026 Megapodsindia · Surat, Gujarat, India
          </p>
        </div>
        `,
      }),
    })

    const data = await response.json()

    console.log("BREVO STATUS:", response.status)
    console.log("BREVO RESPONSE:", data)

    if (!response.ok) {
      throw new Error("Brevo email failed")
    }

  } catch (error) {
    console.error("EMAIL ERROR:", error)
  }
}

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
      password: hashedPassword,
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
        contact: user.contact,
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
        contact: user.contact,
      },
    })

  } catch (err) {

    console.error("LOGIN ERROR:", err)
    res.status(500).json({ message: "Server error" })

  }
})

/* ── FORGOT PASSWORD ── */
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
      expiresAt: Date.now() + 10 * 60 * 1000,
    }

    console.log(`🔑 OTP for ${email}: ${otp}`)

    await sendOTPEmail(email, user.fullName, otp)

    res.json({ message: "OTP sent to your email" })

  } catch (err) {

    console.error("FORGOT PASSWORD ERROR:", err)
    res.status(500).json({ message: "Failed to send email" })

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

      return res.status(400).json({ message: "OTP expired. Please request a new one." })

    }

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" })

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" })

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await User.findOneAndUpdate({ email }, { password: hashedPassword })

    delete otpStore[email]

    res.json({ message: "Password reset successfully" })

  } catch (err) {

    console.error("RESET PASSWORD ERROR:", err)
    res.status(500).json({ message: "Server error" })

  }
})

module.exports = router