import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVisitorAlert(source, data) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: "manishsparihar2020@gmail.com",
      subject: `Portfolio Visit from ${source}`,
      text: `Someone visited your portfolio from ${source}!\n\nDetails:\n- Device: ${data.device || "Unknown"}\n- Browser: ${data.browser || "Unknown"}\n- Country: ${data.country || "Unknown"}\n- Path: ${data.path || "/"}\n- Time: ${new Date().toISOString()}`,
      html: `
        <h2>New Portfolio Visitor from ${source}</h2>
        <p>Someone just visited your portfolio!</p>
        <table style="border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Source</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${source}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Device</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.device || "Unknown"}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Browser</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.browser || "Unknown"}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Country</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.country || "Unknown"}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Page</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.path || "/"}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
        </table>
      `,
    });
  } catch (error) {
    console.error("Failed to send visitor alert email:", error);
  }
}
