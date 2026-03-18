const express   = require("express");
const router    = express.Router();
const auth      = require("../middleware/auth");
const Quotation = require("../models/Quotation");
const User      = require("../models/User");
const { sendQuoteSavedEmail } = require("../utils/mailer"); // ← ADDED

const MATERIAL_PRICES = {
  "Standard Steel":    0,
  "Corten Steel":      25000,
  "Galvanized Steel":  18000,
  "Aluminium":         35000,
};

const CONTAINER_BASE_PRICES = {
  "10ft":    150000,
  "20ft":    220000,
  "40ft":    380000,
  "40ft HC": 420000,
};

const ADDON_PRICES = {
  "Air Conditioning":          15000,
  "Solar Panels":              40000,
  "Premium Insulation":        12000,
  "Security System":           18000,
  "Custom Branding Wrap":      20000,
  "Modular Furniture Package": 30000,
};

const TAX_RATE = 0.18;

/* ── CONFIG ── */
router.get("/config", auth, (req, res) => {
  res.json({
    materials:          Object.keys(MATERIAL_PRICES),
    sizes:              Object.keys(CONTAINER_BASE_PRICES),
    addons:             Object.entries(ADDON_PRICES).map(([name, price]) => ({ name, price })),
    taxRate:            TAX_RATE,
    materialSurcharges: MATERIAL_PRICES,
    basePrices:         CONTAINER_BASE_PRICES,
  });
});

/* ── CALCULATE ── */
router.post("/calculate", auth, (req, res) => {
  const { materialType, containerSize, quantity, selectedAddons = [] } = req.body;
  if (!materialType || !containerSize || !quantity)
    return res.status(400).json({ message: "Missing required fields" });

  const basePrice     = CONTAINER_BASE_PRICES[containerSize] ?? 0;
  const materialExtra = MATERIAL_PRICES[materialType] ?? 0;
  const unitPrice     = basePrice + materialExtra;

  const addonBreakdown = selectedAddons.map((name) => ({ name, price: ADDON_PRICES[name] ?? 0 }));
  const addonTotal     = addonBreakdown.reduce((s, a) => s + a.price, 0);
  const subtotal       = unitPrice * quantity + addonTotal;
  const taxAmount      = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total          = parseFloat((subtotal + taxAmount).toFixed(2));

  res.json({ materialType, containerSize, quantity, unitPrice, addonBreakdown, addonTotal, subtotal, taxRate: TAX_RATE, taxAmount, total });
});

/* ── SAVE QUOTE ── */
router.post("/save", auth, async (req, res) => {
  try {
    const {
      materialType, containerSize, quantity, selectedAddons = [],
      containerSizeNote = "", materialTypeNote = "", addonsNote = "",
    } = req.body;

    const user = await User.findById(req.user.id);

    const basePrice     = CONTAINER_BASE_PRICES[containerSize] ?? 0;
    const materialExtra = MATERIAL_PRICES[materialType] ?? 0;
    const unitPrice     = basePrice + materialExtra;

    const addons     = selectedAddons.map((name) => ({ name, price: ADDON_PRICES[name] ?? 0 }));
    const addonTotal = addons.reduce((s, a) => s + a.price, 0);
    const subtotal   = unitPrice * quantity + addonTotal;
    const taxAmount  = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total      = parseFloat((subtotal + taxAmount).toFixed(2));
    const quoteNumber = `MPI-${Date.now()}`;

    const quotation = new Quotation({
      userId:      req.user.id,
      userName:    user?.fullName || req.user.fullName,
      userContact: user?.contact  || "",
      quoteNumber,
      materialType,
      containerSize,
      quantity,
      addons,
      unitPrice,
      subtotal,
      taxAmount,
      total,
      containerSizeNote,
      materialTypeNote,
      addonsNote,
    });

    await quotation.save();

    // ── Send quote saved email (non-blocking) ── ADDED
    sendQuoteSavedEmail({
      quoteNumber:   quotation.quoteNumber,
      userName:      user?.fullName  || "",
      userEmail:     user?.email     || "",
      containerSize: quotation.containerSize,
      materialType:  quotation.materialType,
      quantity:      quotation.quantity,
      total:         quotation.total,
    }).catch(err => console.error("Quote saved email failed:", err));

    res.status(201).json({ message: "Quotation saved", quotation });
  } catch (err) {
    console.error("SAVE QUOTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── MY QUOTES ── */
router.get("/my-quotes", auth, async (req, res) => {
  try {
    const quotes = await Quotation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ── UPDATE QUOTE ── */
router.put("/:id", auth, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation)
      return res.status(404).json({ message: "Quote not found" });

    if (quotation.userId.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorised to update this quote" });

    const {
      materialType, containerSize, quantity, selectedAddons = [],
      containerSizeNote = "", materialTypeNote = "", addonsNote = "",
    } = req.body;

    const basePrice     = CONTAINER_BASE_PRICES[containerSize] ?? 0;
    const materialExtra = MATERIAL_PRICES[materialType] ?? 0;
    const unitPrice     = basePrice + materialExtra;

    const addons     = selectedAddons.map((name) => ({ name, price: ADDON_PRICES[name] ?? 0 }));
    const addonTotal = addons.reduce((s, a) => s + a.price, 0);
    const subtotal   = unitPrice * quantity + addonTotal;
    const taxAmount  = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total      = parseFloat((subtotal + taxAmount).toFixed(2));

    quotation.materialType      = materialType;
    quotation.containerSize     = containerSize;
    quotation.quantity          = quantity;
    quotation.addons            = addons;
    quotation.unitPrice         = unitPrice;
    quotation.subtotal          = subtotal;
    quotation.taxAmount         = taxAmount;
    quotation.total             = total;
    quotation.containerSizeNote = containerSizeNote;
    quotation.materialTypeNote  = materialTypeNote;
    quotation.addonsNote        = addonsNote;

    await quotation.save();
    res.json({ message: "Quotation updated", quotation });
  } catch (err) {
    console.error("UPDATE QUOTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── DELETE QUOTE ── */
router.delete("/:id", auth, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation)
      return res.status(404).json({ message: "Quote not found" });

    if (quotation.userId.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorised to delete this quote" });

    await quotation.deleteOne();
    res.json({ message: "Quote deleted successfully" });
  } catch (err) {
    console.error("DELETE QUOTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;