require("dotenv").config()

const express   = require("express")
const mongoose  = require("mongoose")
const cors      = require("cors")

const authRoutes         = require("./routes/auth")
const quotationRoutes    = require("./routes/quotations")
const negotiationRoutes  = require("./routes/negotiations")
const adminRoutes        = require("./routes/admin")

const app = express()

/* ── CORS ── */
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

/* ── BODY PARSER ── */
app.use(express.json())

/* ── DATABASE ── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅  MongoDB Connected"))
  .catch((err) => console.log("❌  MongoDB Error:", err))

/* ── ROUTES ── */
app.use("/api/auth",         authRoutes)
app.use("/api/quotations",   quotationRoutes)
app.use("/api/negotiations", negotiationRoutes)
app.use("/api/admin",        adminRoutes)

app.get("/", (req, res) => res.send("Megapods Backend ✅"))

/* ── SERVER ── */
app.listen(8080, () => console.log("🚀  Server running on port 8080"))