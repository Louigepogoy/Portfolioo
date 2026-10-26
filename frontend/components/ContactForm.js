"use client";

import { useState } from "react";
import { API_URL } from "../lib/api";

const empty = { name: "", email: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [notice, setNotice] = useState("");

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    setNotice("");
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors || {});
        setNotice(data.error === "Validation failed" ? "Please fix the fields below." : data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setForm(empty);
      setStatus("sent");
      setNotice("Thanks! Your message was sent. I'll get back to you soon.");
    } catch {
      setStatus("error");
      setNotice("Couldn't reach the server. You can message me on Facebook, Instagram or Gmail instead.");
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form__row">
        <label>
          Name
          <input name="name" value={form.name} onChange={update} placeholder="Juan Dela Cruz" autoComplete="name" required />
          {errors.name && <span className="form__error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} placeholder="you@email.com" autoComplete="email" required />
          {errors.email && <span className="form__error">{errors.email}</span>}
        </label>
      </div>
      <label>
        Message
        <textarea name="message" rows={5} value={form.message} onChange={update} placeholder="Tell me about your project…" required />
        {errors.message && <span className="form__error">{errors.message}</span>}
      </label>
      <input className="form__hp" name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" aria-hidden />
      <button className="btn btn--primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {notice && (
        <p className={`form__notice ${status === "sent" ? "form__notice--ok" : ""}`} role="status">
          {notice}
        </p>
      )}
    </form>
  );
}
