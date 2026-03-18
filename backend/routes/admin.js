const express     = require("express");
const router      = express.Router();
const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const adminAuth   = require("../middleware/adminAuth");
const Admin       = require("../models/Admin");
const Negotiation = require("../models/Negotiation");
const Quotation   = require("../models/Quotation");                          // ← ADDED
const { sendNegotiationResponseEmail } = require("../utils/mailer");

/* ── ADMIN LOGIN ── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, admin: { email: admin.email, name: admin.name } });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── GET ALL NEGOTIATIONS ── */
router.get("/negotiations", adminAuth, async (req, res) => {
  try {
    const negotiations = await Negotiation.find()
      .sort({ createdAt: -1 })
      .populate("quotationId", "containerSize materialType quantity");
    res.json(negotiations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── RESPOND TO NEGOTIATION (accept / reject) ── */
router.put("/negotiations/:id", adminAuth, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ message: "Status must be accepted or rejected" });

    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation)
      return res.status(404).json({ message: "Negotiation not found" });
    if (negotiation.status !== "pending")
      return res.status(400).json({ message: "This negotiation has already been responded to" });

    negotiation.status        = status;
    negotiation.adminResponse = adminResponse || "";
    await negotiation.save();

    // Send email notification to customer (non-blocking)
    sendNegotiationResponseEmail({
      quoteNumber:   negotiation.quoteNumber,
      originalTotal: negotiation.originalTotal,
      offeredPrice:  negotiation.offeredPrice,
      status,
      adminResponse: adminResponse || "",
      userName:      negotiation.userId?.fullName || "",
      userEmail:     negotiation.userEmail || "",
    }).catch((err) => console.error("Response email failed:", err));

    res.json({ message: `Negotiation ${status}`, negotiation });
  } catch (err) {
    console.error("ADMIN RESPOND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── GET STATS ── */
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [total, pending, accepted, rejected] = await Promise.all([
      Negotiation.countDocuments(),
      Negotiation.countDocuments({ status: "pending" }),
      Negotiation.countDocuments({ status: "accepted" }),
      Negotiation.countDocuments({ status: "rejected" }),
    ]);
    res.json({ total, pending, accepted, rejected });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── GET ALL QUOTATIONS ── */                                                // ← ADDED
router.get("/quotations", adminAuth, async (req, res) => {                   // ← ADDED
  try {                                                                       // ← ADDED
    const quotes = await Quotation.find()                                     // ← ADDED
      .sort({ createdAt: -1 })                                                // ← ADDED
      .limit(200);                                                            // ← ADDED
    res.json(quotes);                                                         // ← ADDED
  } catch (err) {                                                             // ← ADDED
    console.error("ADMIN QUOTATIONS ERROR:", err);                            // ← ADDED
    res.status(500).json({ message: "Server error" });                        // ← ADDED
  }                                                                           // ← ADDED
});                                                                           // ← ADDED

module.exports = router;