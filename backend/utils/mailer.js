const nodemailer = require("nodemailer");

// ── Brevo SMTP Transporter (matches your Render env variables exactly) ────────
const transporter = nodemailer.createTransport({
  host:   process.env.BREVO_SMTP_HOST,
  port:   parseInt(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// ── Verify connection on startup ──────────────────────────────────────────────
transporter.verify((err) => {
  if (err) console.error("❌ Brevo mailer not connected:", err.message);
  else     console.log("✅ Brevo mailer ready");
});

// ── Sender details ────────────────────────────────────────────────────────────
const FROM = `"${process.env.BREVO_FROM_NAME || "Megapodsindia"}" <${process.env.BREVO_FROM_EMAIL}>`;

// ── Shared HTML wrapper ────────────────────────────────────────────────────────
function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Megapodsindia</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#ea580c,#c2410c);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:12px;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">MEGAPODSINDIA</span>
            </div>
            <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">Smart Spaces for Modern Living</div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 40px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8f8f8;border-top:1px solid #eeeeee;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">
              This email was sent by <strong>Megapodsindia</strong> · Surat, Gujarat, India<br/>
              <a href="https://megapodsindia.shop" style="color:#ea580c;text-decoration:none;">megapodsindia.shop</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── 1. Negotiation Response Email ─────────────────────────────────────────────
async function sendNegotiationResponseEmail({
  quoteNumber,
  originalTotal,
  offeredPrice,
  status,
  adminResponse,
  userName,
  userEmail,
}) {
  if (!userEmail) return;

  const isAccepted = status === "accepted";
  const discount   = (((originalTotal - offeredPrice) / originalTotal) * 100).toFixed(1);
  const formatINR  = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const statusColor  = isAccepted ? "#16a34a" : "#dc2626";
  const statusBg     = isAccepted ? "#f0fdf4" : "#fef2f2";
  const statusBorder = isAccepted ? "#bbf7d0" : "#fecaca";
  const statusIcon   = isAccepted ? "✅" : "❌";
  const statusLabel  = isAccepted ? "ACCEPTED" : "REJECTED";

  const content = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">
      ${statusIcon} Negotiation ${isAccepted ? "Accepted!" : "Rejected"}
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
      Hi ${userName || "there"}, here's an update on your price negotiation for quote <strong>${quoteNumber}</strong>.
    </p>

    <!-- Status badge -->
    <div style="background:${statusBg};border:1px solid ${statusBorder};border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <span style="font-size:13px;font-weight:800;color:${statusColor};letter-spacing:0.08em;">${statusLabel}</span>
    </div>

    <!-- Price comparison -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="48%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:0.06em;margin-bottom:6px;text-transform:uppercase;">Original Price</div>
          <div style="font-size:20px;font-weight:700;color:#374151;text-decoration:line-through;">${formatINR(originalTotal)}</div>
        </td>
        <td width="4%" style="text-align:center;font-size:18px;color:#9ca3af;">→</td>
        <td width="48%" style="background:${isAccepted ? "#f0fdf4" : "#fef2f2"};border:1px solid ${statusBorder};border-radius:10px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:${statusColor};font-weight:600;letter-spacing:0.06em;margin-bottom:6px;text-transform:uppercase;">Your Offer</div>
          <div style="font-size:20px;font-weight:700;color:${statusColor};">${formatINR(offeredPrice)}</div>
        </td>
      </tr>
    </table>

    ${isAccepted ? `
    <!-- Savings chip -->
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 16px;margin-bottom:24px;text-align:center;">
      <span style="font-size:13px;color:#ea580c;font-weight:700;">🎉 You saved ${formatINR(originalTotal - offeredPrice)} (${discount}% off)</span>
    </div>
    ` : ""}

    ${adminResponse ? `
    <!-- Admin message -->
    <div style="background:#f9fafb;border-left:4px solid ${statusColor};border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:24px;">
      <div style="font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:0.06em;margin-bottom:6px;text-transform:uppercase;">Message from Megapodsindia</div>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${adminResponse}</p>
    </div>
    ` : ""}

    ${isAccepted ? `
    <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
      Our team will reach out to you shortly to proceed with the order. You can also visit our website to explore more options.
    </p>
    <div style="text-align:center;">
      <a href="https://megapodsindia.shop" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#c2410c);color:#ffffff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;">
        Visit Megapodsindia →
      </a>
    </div>
    ` : `
    <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
      We appreciate your interest. Feel free to generate a new quotation or contact us for further assistance.
    </p>
    <div style="text-align:center;">
      <a href="https://megapodsindia.shop" style="display:inline-block;background:#374151;color:#ffffff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;">
        Get New Quote →
      </a>
    </div>
    `}
  `;

  await transporter.sendMail({
    from:    FROM,
    to:      userEmail,
    subject: `${isAccepted ? "🎉 Your offer was accepted!" : "Update on your negotiation"} — ${quoteNumber}`,
    html:    emailWrapper(content),
  });

  console.log(`📧 Negotiation response email sent to ${userEmail} [${status}]`);
}

// ── 2. Quote Saved Confirmation Email ─────────────────────────────────────────
async function sendQuoteSavedEmail({
  quoteNumber,
  userName,
  userEmail,
  containerSize,
  materialType,
  quantity,
  total,
}) {
  if (!userEmail) return;

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const content = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">
      📋 Quotation Saved Successfully
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
      Hi ${userName || "there"}, your quotation has been saved. Here's a summary:
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-size:11px;color:#ea580c;font-weight:700;letter-spacing:0.08em;margin-bottom:14px;text-transform:uppercase;">Quote Details</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ["Quote Number",    quoteNumber],
          ["Container Size",  containerSize],
          ["Material Type",   materialType],
          ["Quantity",        `${quantity} unit${quantity > 1 ? "s" : ""}`],
          ["Total Amount",    formatINR(total)],
        ].map(([label, val]) => `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#9ca3af;width:45%;">${label}</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#374151;">${val}</td>
        </tr>`).join("")}
      </table>
    </div>

    <p style="font-size:13px;color:#6b7280;margin:0 0 20px;line-height:1.6;">
      This is an indicative quotation. Final pricing may vary based on site conditions and delivery location. Valid for 30 days.
    </p>

    <div style="text-align:center;">
      <a href="https://megapodsindia.shop" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#c2410c);color:#ffffff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;">
        View My Quotes →
      </a>
    </div>
  `;

  await transporter.sendMail({
    from:    FROM,
    to:      userEmail,
    subject: `📋 Your quotation ${quoteNumber} has been saved`,
    html:    emailWrapper(content),
  });

  console.log(`📧 Quote saved email sent to ${userEmail}`);
}

// ── 3. Welcome Email ──────────────────────────────────────────────────────────
async function sendWelcomeEmail({ userName, userEmail }) {
  if (!userEmail) return;

  const content = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">
      👋 Welcome to Megapodsindia!
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
      Hi ${userName || "there"}, your account has been created successfully.
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
        You can now generate custom quotations, negotiate prices, and track your orders — all from your personal dashboard.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        ["📦", "Get Instant Quotes",     "Configure your container and get a price instantly"],
        ["🤝", "Negotiate Prices",        "Submit your offer and our team will review it"],
        ["📊", "Track Your Orders",       "View all your quotations in one place"],
      ].map(([icon, title, desc]) => `
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:40px;font-size:22px;">${icon}</td>
        <td style="padding:10px 0 10px 10px;">
          <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:2px;">${title}</div>
          <div style="font-size:13px;color:#6b7280;">${desc}</div>
        </td>
      </tr>`).join("")}
    </table>

    <div style="text-align:center;">
      <a href="https://megapodsindia.shop" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#c2410c);color:#ffffff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;">
        Get Your First Quote →
      </a>
    </div>
  `;

  await transporter.sendMail({
    from:    FROM,
    to:      userEmail,
    subject: `👋 Welcome to Megapodsindia, ${userName || ""}!`,
    html:    emailWrapper(content),
  });

  console.log(`📧 Welcome email sent to ${userEmail}`);
}

module.exports = {
  sendNegotiationResponseEmail,
  sendQuoteSavedEmail,
  sendWelcomeEmail,
};