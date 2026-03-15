require("dotenv").config()

const express   = require("express")
const mongoose  = require("mongoose")
const cors      = require("cors")
app.use(cors());

const authRoutes      = require("./routes/auth")
const quotationRoutes = require("./routes/quotations")

const app = express()

/* ── CORS ── */
app.use(cors({ origin: "http://localhost:5173" }))

/* ── BODY PARSER ── */
app.use(express.json())

/* ── DATABASE ── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅  MongoDB Connected"))
  .catch((err) => console.log("❌  MongoDB Error:", err))

/* ── ROUTES ── */
app.use("/api/auth",       authRoutes)
app.use("/api/quotations", quotationRoutes)

app.get("/", (req, res) => res.send("Megapods Backend ✅"))

/* ── SERVER ── */
app.listen(8080, () => console.log("🚀  Server running on port 8080"))