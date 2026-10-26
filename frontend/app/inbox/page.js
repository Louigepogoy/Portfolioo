"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import ThemeToggle from "../../components/ThemeToggle";

const STORAGE_KEY = "inbox-token";

function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function InboxPage() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (t) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load messages");
      setMessages(data);
      setToken(t);
      try {
        sessionStorage.setItem(STORAGE_KEY, t);
      } catch {}
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Can't reach the API. Is the backend running?" : err.message);
      setToken("");
      setMessages(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem(STORAGE_KEY) || "";
    } catch {}
    if (saved) load(saved);
  }, [load]);

  // Keep the inbox fresh while it's open.
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => load(token), 30000);
    return () => clearInterval(id);
  }, [token, load]);

  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`${API_URL}/api/messages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setMessages((m) => m.filter((x) => x.id !== id));
  }

  function logout() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setToken("");
    setMessages(null);
    setInput("");
  }

  return (
    <main className="inbox container">
      <header className="inbox__head">
        <div>
          <a href="/" className="inbox__back">← Back to portfolio</a>
          <h1>Inbox</h1>
          {messages && <p className="lead">{messages.length} message{messages.length === 1 ? "" : "s"}</p>}
        </div>
        <div className="inbox__actions">
          {token && (
            <>
              <button className="btn btn--ghost btn--sm" onClick={() => load(token)} disabled={loading}>
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button className="btn btn--ghost btn--sm" onClick={logout}>Log out</button>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>

      {!token && (
        <form
          className="form inbox__login"
          onSubmit={(e) => {
            e.preventDefault();
            load(input.trim());
          }}
        >
          <label>
            Admin password
            <input type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ADMIN_TOKEN from backend/.env" autoFocus />
          </label>
          <button className="btn btn--primary" disabled={!input || loading}>{loading ? "Checking…" : "Open inbox"}</button>
          {error && <p className="form__notice">{error}</p>}
        </form>
      )}

      {token && error && <p className="form__notice">{error}</p>}

      {messages && messages.length === 0 && <p className="inbox__empty">No messages yet. They&apos;ll show up here.</p>}

      {messages && messages.length > 0 && (
        <ul className="inbox__list">
          {messages.map((m) => (
            <li key={m.id} className="inbox__item">
              <div className="inbox__meta">
                <span className="inbox__avatar">{m.name.charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{m.name}</strong>
                  <a href={`mailto:${m.email}`}>{m.email}</a>
                </div>
                <time dateTime={m.createdAt} title={new Date(m.createdAt).toLocaleString()}>{timeAgo(m.createdAt)}</time>
              </div>
              <p className="inbox__msg">{m.message}</p>
              <div className="inbox__btns">
                <a
                  className="btn btn--small"
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(m.email)}&su=${encodeURIComponent("Re: your message on my portfolio")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reply in Gmail
                </a>
                <button className="btn btn--danger" onClick={() => remove(m.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
