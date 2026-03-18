const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// ── Sender details ────────────────────────────────────────────
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "dhruvrathod177@gmail.com";
const FROM_NAME  = process.env.BREVO_FROM_NAME || "Megapodsindia";

// ── Shared HTML wrapper ────────────────────────────────────────
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

        <tr>
          <td style="background:linear-gradient(135deg,#ea580c,#c2410c);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:12px;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;">MEGAPODSINDIA</span>
            </div>
            <div style="color:rgba(255,255,255,0.75);font-size:13px;">Smart Spaces for Modern Living</div>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            ${content}
          </td>
        </tr>

        <tr>
          <td style="background:#f8f8f8;border-top:1px solid #eeeeee;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              Megapodsindia · Surat, Gujarat
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── COMMON SEND FUNCTION ───────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  console.log("EMAIL STATUS:", response.status);
  console.log("EMAIL RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data.message || "Email failed");
  }
}

// ── 1. Negotiation Response Email ─────────────────────────────
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
  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const statusLabel = isAccepted ? "ACCEPTED" : "REJECTED";

  const content = `
    <h2>${isAccepted ? "✅ Accepted" : "❌ Rejected"}</h2>
    <p>Hi ${userName}, Quote <b>${quoteNumber}</b> is ${statusLabel}</p>
    <p>Price: ${formatINR(offeredPrice)}</p>
    ${adminResponse ? `<p>${adminResponse}</p>` : ""}
  `;

  await sendEmail({
    to: userEmail,
    subject: `Quote ${statusLabel} - ${quoteNumber}`,
    html: emailWrapper(content),
  });

  console.log("📧 Negotiation email sent");
}

// ── 2. Quote Saved Email ──────────────────────────────────────
async function sendQuoteSavedEmail({
  quoteNumber,
  userName,
  userEmail,
  total,
}) {
  if (!userEmail) return;

  const content = `
    <h2>Quotation Saved</h2>
    <p>Hi ${userName}, your quote ${quoteNumber} is saved.</p>
    <p>Total: ₹${total}</p>
  `;

  await sendEmail({
    to: userEmail,
    subject: "Quote Saved",
    html: emailWrapper(content),
  });

  console.log("📧 Quote email sent");
}

// ── 3. Welcome Email ──────────────────────────────────────────
async function sendWelcomeEmail({ userName, userEmail }) {
  if (!userEmail) return;

  const content = `
    <h2>Welcome ${userName}</h2>
    <p>Your account is created successfully.</p>
  `;

  await sendEmail({
    to: userEmail,
    subject: "Welcome to Megapodsindia",
    html: emailWrapper(content),
  });

  console.log("📧 Welcome email sent");
}

// ── 4. Admin Quote Response Email ─────────────────────────────
async function sendAdminQuoteResponseEmail({
  userName,
  userEmail,
  quoteNumber,
  adminNote,
  adminPrice,
  originalTotal,
}) {
  if (!userEmail) return;

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const priceSection = adminPrice ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-top:20px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#ea580c;letter-spacing:2px;text-transform:uppercase;">Final Pricing</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Base Estimate</td>
              <td style="font-size:13px;color:#6b7280;text-align:right;text-decoration:line-through;">${formatINR(originalTotal)}</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:800;color:#111827;padding-top:8px;">Final Price</td>
              <td style="font-size:20px;font-weight:800;color:#ea580c;text-align:right;padding-top:8px;">${formatINR(adminPrice)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>` : "";

  const content = `
    <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hello <strong>${userName}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Our team has reviewed your request for quotation
      <strong style="color:#ea580c;">${quoteNumber}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Message from our team</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">${adminNote}</p>
        </td>
      </tr>
    </table>

    ${priceSection}

    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you have any questions, feel free to reach out or submit a negotiation offer from your quotation dashboard.
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `📋 Update on your quotation ${quoteNumber} — Megapodsindia`,
    html: emailWrapper(content),
  });

  console.log("📧 Admin quote response email sent to", userEmail);
}

module.exports = {
  sendNegotiationResponseEmail,
  sendQuoteSavedEmail,
  sendWelcomeEmail,
  sendAdminQuoteResponseEmail,
};