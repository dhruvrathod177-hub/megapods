const express      = require("express");
const router       = express.Router();
const auth         = require("../middleware/auth");
const Negotiation  = require("../models/Negotiation");
const Quotation    = require("../models/Quotation");

/* ── SUBMIT NEGOTIATION ── */
router.post("/", auth, async (req, res) => {
  try {
    const { quotationId, offeredPrice, message } = req.body;

    if (!quotationId || !offeredPrice || !message)
      return res.status(400).json({ message: "quotationId, offeredPrice and message are required" });

    const userId      = req.user.id;
    const userName    = req.user.fullName || "Unknown";
    const userEmail   = req.user.email    || "";
    const userContact = req.user.contact  || "";

    const quotation = await Quotation.findById(quotationId);
    if (!quotation)
      return res.status(404).json({ message: "Quote not found" });
    if (quotation.userId.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorised" });

    const existing = await Negotiation.findOne({ quotationId, status: "pending" });
    if (existing)
      return res.status(409).json({ message: "A negotiation is already pending for this quote" });

    const negotiation = new Negotiation({
      quotationId,
      userId,
      quoteNumber:   quotation.quoteNumber,
      originalTotal: quotation.total,
      offeredPrice:  parseFloat(offeredPrice),
      message,
      userName,
      userEmail,
      userContact,
    });

    await negotiation.save();

    res.status(201).json({ message: "Negotiation submitted", negotiation });
  } catch (err) {
    console.error("NEGOTIATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── GET NEGOTIATION STATUS FOR A QUOTE ── */
router.get("/quote/:quotationId", auth, async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({
      quotationId: req.params.quotationId,
      userId: req.user.id,
    }).sort({ createdAt: -1 });
    res.json(negotiation || null);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── GET ALL MY NEGOTIATIONS ── */
router.get("/my", auth, async (req, res) => {
  try {
    const negotiations = await Negotiation.find({ userId: req.user.id });
    res.json(negotiations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;