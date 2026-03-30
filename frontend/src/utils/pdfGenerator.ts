import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface PDFData {
  quoteNumber: string;
  quoteDate: string;
  customerName: string;
  customerEmail: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    subtext?: string;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  negotiatedPrice?: number;
  notes?: {
    label: string;
    text: string;
  }[];
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const generateQuotationPDF = async (data: PDFData) => {
  const {
    quoteNumber,
    quoteDate,
    customerName,
    customerEmail,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    negotiatedPrice,
    notes,
  } = data;

  const displayTotal = negotiatedPrice ?? total;

  // Build HTML for PDF
  const addonRows = items.slice(1).map((item) => `
    <tr>
      <td class="desc">${item.description}${item.subtext ? `<br/><span class="sub">${item.subtext}</span>` : ""}</td>
      <td class="center">${item.quantity}</td>
      <td class="right">${formatINR(item.unitPrice)}</td>
      <td class="right">${formatINR(item.total)}</td>
    </tr>`).join("");

  const mainItem = items[0];
  const noteRows = notes?.map(note => `
    <div class="note-block">
      <p class="note-label">${note.label}</p>
      <p class="note-text">${note.text}</p>
    </div>`).join("") || "";

  const negotiatedRow = negotiatedPrice 
    ? `<div class="total-row negotiated"><span>Negotiated Price</span><span>${formatINR(negotiatedPrice)}</span></div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f3f4f6; display: flex; justify-content: center; padding: 0; }
  .page { background: #fff; width: 794px; min-height: 1123px; padding: 0; position: relative; display: flex; flex-direction: column; }
  .header { background: linear-gradient(135deg, #ea580c, #c2410c); color: #fff; padding: 40px 50px; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { display: flex; align-items: center; }
  .logo { height: 60px; width: 60px; border-radius: 50%; background: #fff; padding: 5px; margin-right: 15px; object-fit: contain; }
  .brand-name { font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
  .brand-loc { font-size: 13px; color: #fed7aa; margin-top: 2px; }
  .quote-label { text-align: right; }
  .quote-label .title { font-size: 32px; font-weight: 900; letter-spacing: 3px; margin-bottom: 5px; }
  .quote-label .num { font-size: 14px; color: #fed7aa; font-weight: 600; }
  .quote-label .date { font-size: 14px; color: #fed7aa; }
  .divider { border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 25px 0; }
  .info-section { display: flex; justify-content: space-between; }
  .prepared-for { flex: 1; }
  .info-label { font-size: 12px; color: #fed7aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
  .client-name { font-size: 18px; font-weight: 700; }
  .client-email { font-size: 14px; color: #fed7aa; }
  
  .body { padding: 50px; flex-grow: 1; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  thead th { padding: 12px 10px; color: #6b7280; font-weight: 700; text-align: left; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
  thead th.right { text-align: right; }
  thead th.center { text-align: center; }
  tbody td { padding: 15px 10px; color: #1f2937; vertical-align: top; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
  td.desc { font-weight: 600; line-height: 1.4; }
  .sub { font-size: 12px; color: #6b7280; font-weight: 400; display: block; margin-top: 2px; }
  td.center { text-align: center; }
  td.right { text-align: right; }
  td.bold { font-weight: 700; }
  
  .footer-content { display: flex; justify-content: space-between; gap: 40px; }
  .notes-section { flex: 1; }
  .totals-section { width: 280px; }
  
  .totals { border-top: 2px solid #f3f4f6; padding-top: 10px; }
  .total-row { display: flex; justify-content: space-between; font-size: 14px; color: #4b5563; padding: 6px 0; }
  .total-row.negotiated { color: #16a34a; font-weight: 700; }
  .total-final { display: flex; justify-content: space-between; font-size: 22px; font-weight: 800; color: #111827; border-top: 2px solid #111827; margin-top: 15px; padding-top: 15px; }
  .total-final .amount { color: #ea580c; }
  
  .notes-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; }
  .notes-title { font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 1px solid #fed7aa; padding-bottom: 8px; }
  .note-block { margin-bottom: 12px; }
  .note-block:last-child { margin-bottom: 0; }
  .note-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
  .note-text { font-size: 13px; color: #374151; line-height: 1.5; }
  
  .terms { font-size: 11px; color: #9ca3af; font-style: italic; margin-top: 40px; line-height: 1.6; border-top: 1px solid #f3f4f6; padding-top: 20px; }
  .bottom-strip { background: #fff7ed; border-top: 1px solid #fed7aa; padding: 15px 50px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af; }
  .bottom-strip strong { color: #ea580c; }
</style>
</head>
<body>
<div class="page" id="quotation-pdf-content">
  <div class="header">
    <div class="header-top">
      <div class="brand">
        <img src="/img/logo1.JPG" class="logo" alt="Logo"/>
        <div>
          <div class="brand-name">Megapodsindia</div>
          <div class="brand-loc">Surat, Gujarat, India</div>
        </div>
      </div>
      <div class="quote-label">
        <div class="title">QUOTATION</div>
        <div class="num">#${quoteNumber}</div>
        <div class="date">${quoteDate}</div>
      </div>
    </div>
    <hr class="divider"/>
    <div class="info-section">
      <div class="prepared-for">
        <p class="info-label">Prepared For</p>
        <p class="client-name">${customerName}</p>
        <p class="client-email">${customerEmail}</p>
      </div>
    </div>
  </div>
  
  <div class="body">
    <table>
      <thead>
        <tr>
          <th style="width: 50%">Description</th>
          <th class="center">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="desc">
            ${mainItem.description}
            ${mainItem.subtext ? `<span class="sub">${mainItem.subtext}</span>` : ""}
          </td>
          <td class="center">${mainItem.quantity}</td>
          <td class="right">${formatINR(mainItem.unitPrice)}</td>
          <td class="right bold">${formatINR(mainItem.total)}</td>
        </tr>
        ${addonRows}
      </tbody>
    </table>
    
    <div class="footer-content">
      <div class="notes-section">
        ${noteRows ? `
          <div class="notes-box">
            <div class="notes-title">Custom Requirements</div>
            ${noteRows}
          </div>
        ` : ""}
      </div>
      
      <div class="totals-section">
        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>${formatINR(subtotal)}</span></div>
          <div class="total-row"><span>GST (${(taxRate * 100).toFixed(0)}%)</span><span>${formatINR(taxAmount)}</span></div>
          ${negotiatedRow}
          <div class="total-final"><span>TOTAL</span><span class="amount">${formatINR(displayTotal)}</span></div>
        </div>
      </div>
    </div>
    
    <div class="terms">
      <p>* This is an indicative quotation generated by our automated system. Final pricing may vary based on specific site conditions, further customizations, and actual delivery location at the time of order. This quotation is valid for 30 days from the date of issue.</p>
    </div>
  </div>
  
  <div class="bottom-strip">
    <span>Generated by <strong>Megapodsindia</strong></span>
    <span>www.megapodsindia.com</span>
  </div>
</div>
</body>
</html>`;

  // Create iframe for rendering
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none;";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) throw new Error("Could not access iframe document");

    doc.open();
    doc.write(html);
    doc.close();

    // Wait for images to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const content = doc.getElementById("quotation-pdf-content");
    if (!content) throw new Error("Could not find content element");

    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save(`Quotation_${quoteNumber}.pdf`);

    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  } finally {
    document.body.removeChild(iframe);
  }
};
