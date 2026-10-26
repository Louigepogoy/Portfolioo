import nodemailer from "nodemailer";

const { GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_TO } = process.env;

// Only enabled when Gmail credentials are set in .env; otherwise messages are just saved to the file.
const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } })
    : null;

export const emailEnabled = Boolean(transporter);

const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function notifyNewMessage(entry) {
  if (!transporter) return;
  await transporter.sendMail({
    from: `"Portfolio Contact" <${GMAIL_USER}>`,
    to: NOTIFY_TO || GMAIL_USER,
    replyTo: `"${entry.name}" <${entry.email}>`,
    subject: `New portfolio message from ${entry.name}`,
    text: `${entry.name} <${entry.email}>\n\n${entry.message}\n\nSent ${entry.createdAt}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2 style="margin:0 0 4px">New message from your portfolio</h2>
        <p style="color:#666;margin:0 0 16px">${escape(entry.createdAt)}</p>
        <p><strong>${escape(entry.name)}</strong> &lt;<a href="mailto:${escape(entry.email)}">${escape(entry.email)}</a>&gt;</p>
        <blockquote style="border-left:4px solid #8b5cf6;margin:0;padding:8px 16px;background:#f6f5fb;white-space:pre-wrap">${escape(entry.message)}</blockquote>
        <p style="color:#666">Just hit Reply to answer them.</p>
      </div>`,
  });
}
