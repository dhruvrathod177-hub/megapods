/**
 * Run once to create your admin account:
 *   node scripts/createAdmin.js
 *
 * Then delete or don't commit this file.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const Admin    = require("../models/Admin");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email    = "admin@megapodsindia.shop";   // ← change this
  const password = "MegaAdmin@2026";             // ← change this
  const name     = "Megapods Admin";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  await Admin.create({ email, password: hashed, name });
  console.log("✅ Admin created:", email);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });