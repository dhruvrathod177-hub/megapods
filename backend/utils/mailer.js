const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.BREVO_SMTP_HOST,
  port:   parseInt(process.env.BREVO_SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

/**
 * Send negotiation alert email to admin
 */
const sendNegotiationEmail = async ({ quoteNumber, originalTotal, offeredPrice, message, userName, userEmail, userContact }) => {
  const discount = (((originalTotal - offeredPrice) / originalTotal) * 100).toFixed(1);
  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  await transporter.sendMail({
    from:    `"Megapodsindia" <${process.env.BREVO_SMTP_USER}>`,
    to:      process.env.ADMIN_EMAIL,
    subject: `💬 New Negotiation Request — ${quoteNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ea580c, #c2410c); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">New Negotiation Request</h1>
          <p style="color: #fed7aa; margin: 8px 0 0; font-size: 14px;">Quote ${quoteNumber}</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">

          <!-- Customer Info -->
          <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #374151; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Customer</h2>
            <p style="margin: 4px 0; color: #111827; font-size: 15px;"><strong>${userName}</strong></p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${userEmail}</p>
            ${userContact ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${userContact}</p>` : ""}
          </div>

          <!-- Price Comparison -->
          <div style="display: flex; gap: 12px; margin-bottom: 24px;">
            <div style="flex: 1; background: #fef2f2; border-radius: 10px; padding: 20px; text-align: center;">
              <p style="margin: 0 0 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Original Price</p>
              <p style="margin: 0; color: #374151; font-size: 22px; font-weight: 700;">${formatINR(originalTotal)}</p>
            </div>
            <div style="flex: 1; background: #f0fdf4; border-radius: 10px; padding: 20px; text-align: center;">
              <p style="margin: 0 0 4px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Offered Price</p>
              <p style="margin: 0; color: #16a34a; font-size: 22px; font-weight: 700;">${formatINR(offeredPrice)}</p>
            </div>
          </div>

          <!-- Discount badge -->
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="background: #fff7ed; color: #ea580c; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 999px; border: 1px solid #fed7aa;">
              Customer asking for ${discount}% discount (${formatINR(originalTotal - offeredPrice)} off)
            </span>
          </div>

          <!-- Message -->
          <div style="background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 0 10px 10px 0; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #92400e; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Customer Message</h2>
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">${message}</p>
          </div>

          <!-- CTA -->
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Reply directly to this email or contact the customer to respond to this negotiation request.
          </p>

        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">Megapodsindia · Surat, Gujarat, India</p>
        </div>

      </div>
    `,
  });
};

module.exports = { sendNegotiationEmail };