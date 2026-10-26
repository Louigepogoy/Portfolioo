import express from "express";
import cors from "cors";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notifyNewMessage, emailEnabled } from "./mailer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTFOLIO_FILE = path.join(__dirname, "../../shared/portfolio.json");
const MESSAGES_FILE = path.join(__dirname, "../data/messages.json");

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const startedAt = Date.now();

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN.split(",") }));
app.use(express.json({ limit: "20kb" }));

// Simple in-memory rate limit: 5 messages per IP every 10 minutes.
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= 5) {
    return res.status(429).json({ error: "Too many messages. Please try again later." });
  }
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: Math.round((Date.now() - startedAt) / 1000), time: new Date().toISOString() });
});

app.get("/api/portfolio", async (req, res) => {
  const data = await readJson(PORTFOLIO_FILE, null);
  if (!data) return res.status(500).json({ error: "Portfolio data unavailable" });
  res.json(data);
});

app.post("/api/contact", rateLimit, async (req, res) => {
  const { name = "", email = "", message = "", website = "" } = req.body || {};

  // Honeypot field: real visitors never fill it in.
  if (website) return res.json({ ok: true });

  const errors = {};
  if (name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Please enter a valid email.";
  if (message.trim().length < 10) errors.message = "Message should be at least 10 characters.";
  if (message.length > 3000) errors.message = "Message is too long (max 3000 characters).";
  if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", errors });

  const entry = {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  await mkdir(path.dirname(MESSAGES_FILE), { recursive: true });
  const messages = await readJson(MESSAGES_FILE, []);
  messages.push(entry);
  await writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));

  console.log(`New message from ${entry.name} <${entry.email}>`);
  notifyNewMessage(entry).catch((err) => console.error("Email notification failed:", err.message));
  res.status(201).json({ ok: true, id: entry.id });
});

// Inbox endpoints require header "Authorization: Bearer <ADMIN_TOKEN>"
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN || req.get("authorization") !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: "Wrong password" });
  }
  next();
}

app.get("/api/messages", requireAdmin, async (req, res) => {
  const messages = await readJson(MESSAGES_FILE, []);
  res.json(messages.reverse());
});

app.delete("/api/messages/:id", requireAdmin, async (req, res) => {
  const messages = await readJson(MESSAGES_FILE, []);
  const remaining = messages.filter((m) => m.id !== req.params.id);
  if (remaining.length === messages.length) return res.status(404).json({ error: "Message not found" });
  await writeFile(MESSAGES_FILE, JSON.stringify(remaining, null, 2));
  res.json({ ok: true });
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));

const server = app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
  console.log(emailEnabled ? "Email notifications: ON" : "Email notifications: OFF (set GMAIL_USER and GMAIL_APP_PASSWORD in .env)");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use — the API is probably already running in another terminal.\n` +
        `Close that terminal, or free the port with:\n` +
        `  Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n` +
        `Or run on another port:  $env:PORT=4001; npm run dev\n`
    );
    process.exit(1);
  }
  throw err;
});
