const mongoose = require("mongoose");

const negotiationSchema = new mongoose.Schema(
  {
    quotationId:   { type: mongoose.Schema.Types.ObjectId, ref: "Quotation", required: true },
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User",      required: true },
    quoteNumber:   { type: String, required: true },
    originalTotal: { type: Number, required: true },
    offeredPrice:  { type: Number, required: true },
    message:       { type: String, required: true },
    status:        { type: String, default: "pending", enum: ["pending", "accepted", "rejected"] },
    adminResponse: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Negotiation", negotiationSchema);