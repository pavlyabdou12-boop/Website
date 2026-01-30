"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data?.error || "Something went wrong");
      return;
    }

    setStatus("success");
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input className="w-full border rounded p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="w-full border rounded p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full border rounded p-2" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <textarea className="w-full border rounded p-2" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />

      <button className="px-4 py-2 rounded bg-black text-white disabled:opacity-60" disabled={status === "loading"} type="submit">
        {status === "loading" ? "Sending..." : "Submit"}
      </button>

      {status === "success" && <p className="text-green-600">✅ Sent! We'll contact you soon.</p>}
      {status === "error" && <p className="text-red-600">❌ {errorMsg}</p>}
    </form>
  );
}
