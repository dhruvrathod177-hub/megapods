require("dotenv").config()

const express   = require("express")
const mongoose  = require("mongoose")
const cors      = require("cors")
const helmet    = require("helmet")
const ratelimit = require("express-rate-limit")

const authRoutes         = require("./routes/auth")
const quotationRoutes    = require("./routes/quotations")
const negotiationRoutes  = require("./routes/negotiations")
const adminRoutes        = require("./routes/admin")

const app = express()

app.use(helmet())

const limiter = ratelimit({
  windowMs: 20 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later"
})
app.use(limiter)

app.use(cors({
  origin: [
    "https://megapodsindia.shop",
    "https://www.megapodsindia.shop",
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  )
  next()
})

app.use(express.json())

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅  MongoDB Connected"))
  .catch((err) => console.log("❌  MongoDB Error:", err))

app.use("/api/auth",         authRoutes)
app.use("/api/quotations",   quotationRoutes)
app.use("/api/negotiations", negotiationRoutes)
app.use("/api/admin",        adminRoutes)

app.get("/", (req, res) => res.send("Megapods Backend ✅"))

app.listen(8080, () => console.log("🚀  Server running on port 8080"))