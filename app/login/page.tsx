"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/";
    });
  }, []);

  async function sendMagicLink() {
    setErr(null);
    const e = email.trim();
    if (!e) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: {
        // Works locally because Supabase will redirect back after email confirm.
        // If you set a custom redirect in Supabase Auth settings, update this.
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#0b0b0b", color: "white" }}>
      <div style={{ width: "min(520px, 92vw)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 18, background: "rgba(255,255,255,0.03)" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>CFSP Ops Board</h1>
        <p style={{ opacity: 0.75, marginTop: 8 }}>Sign in to manage events.</p>

        <label style={{ display: "block", marginTop: 14, opacity: 0.85 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@drexel.edu"
          inputMode="email"
          style={{
            width: "100%",
            height: 44,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#0f0f0f",
            color: "white",
            padding: "0 12px",
            marginTop: 6,
            outline: "none",
          }}
        />

        <button
          onClick={sendMagicLink}
          style={{
            marginTop: 14,
            height: 44,
            width: "100%",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Send Magic Link
        </button>

        {sent && (
          <p style={{ marginTop: 12, opacity: 0.85 }}>
            Check your email — click the magic link to sign in.
          </p>
        )}
        {err && (
          <p style={{ marginTop: 12, color: "#ff7777" }}>
            {err}
          </p>
        )}
      </div>
    </main>
  );
}
