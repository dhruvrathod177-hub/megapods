const express     = require("express");
const router      = express.Router();
const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const adminAuth   = require("../middleware/adminAuth");
const Admin       = require("../models/Admin");
const Negotiation = require("../models/Negotiation");
const Quotation   = require("../models/Quotation");
const User        = require("../models/User");
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

/* ── RESPOND TO NEGOTIATION ── */
router.put("/negotiations/:id", adminAuth, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ message: "Status must be accepted or rejected" });

    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation)
      return res.status(404).json({ message: "Negotiation not found" });
    if (negotiation.status !== "pending")
      return res.status(400).json({ message: "Already responded to" });

    negotiation.status        = status;
    negotiation.adminResponse = adminResponse || "";
    await negotiation.save();

    // Send email (non-blocking)
    sendNegotiationResponseEmail({
      quoteNumber:   negotiation.quoteNumber,
      originalTotal: negotiation.originalTotal,
      offeredPrice:  negotiation.offeredPrice,
      status,
      adminResponse: adminResponse || "",
      userName:      negotiation.userName  || "",
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

/* ── GET ALL QUOTATIONS ── */
router.get("/quotations", adminAuth, async (req, res) => {
  try {
    const quotes = await Quotation.find().sort({ createdAt: -1 }).limit(200);
    res.json(quotes);
  } catch (err) {
    console.error("ADMIN QUOTATIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── GET ALL USERS (with stats) ── */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    const enriched = await Promise.all(
      users.map(async (u) => {
        const [quoteCount, negCount, spendAgg] = await Promise.all([
          Quotation.countDocuments({ userId: u._id }),
          Negotiation.countDocuments({ userEmail: u.email }),
          Quotation.aggregate([
            { $match: { userId: u._id } },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ]),
        ]);
        return {
          _id:        u._id,
          fullName:   u.fullName,
          email:      u.email,
          contact:    u.contact  || "",
          createdAt:  u.createdAt,
          quoteCount,
          negCount,
          totalSpend: spendAgg[0]?.total ?? 0,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── GET SINGLE USER DETAIL ── */
router.get("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const [quotes, negotiations] = await Promise.all([
      Quotation.find({ userId: req.params.id }).sort({ createdAt: -1 }),
      Negotiation.find({ userEmail: user.email }).sort({ createdAt: -1 }),
    ]);

    res.json({ user, quotes, negotiations });
  } catch (err) {
    console.error("ADMIN USER DETAIL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── ADMIN RESPOND TO QUOTATION ── */
router.put("/quotations/:id/respond", adminAuth, async (req, res) => {
  try {
    const { adminNote, adminPrice } = req.body;

    if (!adminNote) return res.status(400).json({ message: "Response note is required" });

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    // Update quotation with admin response
    quotation.adminNote        = adminNote;
    quotation.adminPrice       = adminPrice ? parseFloat(adminPrice) : null;
    quotation.adminRespondedAt = new Date();
    if (adminPrice) quotation.total = parseFloat(adminPrice);

    await quotation.save();

    // Find user email
    const user = await User.findById(quotation.userId);
    if (user?.email) {
      const { sendAdminQuoteResponseEmail } = require("../utils/mailer");
      sendAdminQuoteResponseEmail({
        userName:    user.fullName || quotation.userName || "",
        userEmail:   user.email,
        quoteNumber: quotation.quoteNumber,
        adminNote,
        adminPrice:  adminPrice ? parseFloat(adminPrice) : null,
        originalTotal: quotation.subtotal + quotation.taxAmount,
      }).catch(err => console.error("Admin quote response email failed:", err));
    }

    res.json({ message: "Response sent", quotation });
  } catch (err) {
    console.error("ADMIN RESPOND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;