const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // ✅ FIX 3: Store user name and contact in quotation
    userName:      { type: String },
    userContact:   { type: String },
    quoteNumber:   { type: String, required: true, unique: true },
    materialType:  { type: String, required: true },
    containerSize: { type: String, required: true },
    quantity:      { type: Number, required: true },
    addons:        [{ name: String, price: Number }],
    unitPrice:     { type: Number, required: true },
    subtotal:      { type: Number, required: true },
    taxAmount:     { type: Number, required: true },
    total:         { type: Number, required: true },
    status:        { type: String, default: "draft", enum: ["draft", "sent", "accepted", "rejected"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);