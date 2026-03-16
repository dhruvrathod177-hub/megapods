const express    = require("express")
const router     = express.Router()
const bcrypt     = require("bcryptjs")
const jwt        = require("jsonwebtoken")
const axios      = require("axios")
const { Resend } = require("resend")
const User       = require("../models/User")

const otpStore = {}
const resend   = new Resend(process.env.RESEND_API_KEY)

/* ── REGISTER ── */
router.post("/register", async (req, res) => {
  try {
    const { fullName, contact, email, password } = req.body
    if (!fullName || !contact || !email || !password)
      return res.status(400).json({ message: "All fields are required" })
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" })
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({ fullName, contact, email, password: hashedPassword })
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
      { id: user._id, fullName: user.fullName, email: user.email, contact: user.contact },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, contact: user.contact },
    })
  } catch (err) {
    console.error("LOGIN ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

/* ── FORGOT PASSWORD — send OTP via SMS to phone number ── */
router.post("/forgot-password", async (req, res) => {
  try {
    const { phone } = req.body
    if (!phone)
      return res.status(400).json({ message: "Phone number is required" })

    // Find user by contact number
    const user = await User.findOne({ contact: phone })
    if (!user)
      return res.status(400).json({ message: "No account found with this phone number" })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    // Store OTP against phone number
    otpStore[phone] = { otp, email: user.email, expiresAt: Date.now() + 10 * 60 * 1000 }
    console.log(`🔑 OTP for ${phone}: ${otp}`)

    // Send SMS via Fast2SMS
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        variables_values: otp,
        route: "otp",
        numbers: phone,
      },
    })

    console.log("Fast2SMS response:", response.data)

    if (response.data.return === false) {
      throw new Error(response.data.message || "SMS sending failed")
    }

    res.json({ message: "OTP sent to your phone number" })
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err)
    res.status(500).json({ message: "Failed to send OTP. Please try again." })
  }
})

/* ── RESET PASSWORD — verify OTP + update password ── */
router.post("/reset-password", async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body
    if (!phone || !otp || !newPassword)
      return res.status(400).json({ message: "All fields are required" })

    const record = otpStore[phone]
    if (!record)
      return res.status(400).json({ message: "No OTP requested for this phone number" })
    if (Date.now() > record.expiresAt) {
      delete otpStore[phone]
      return res.status(400).json({ message: "OTP expired. Please request a new one." })
    }
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" })
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" })

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    // Update password using email stored in OTP record
    await User.findOneAndUpdate({ email: record.email }, { password: hashedPassword })
    delete otpStore[phone]

    res.json({ message: "Password reset successfully" })
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router