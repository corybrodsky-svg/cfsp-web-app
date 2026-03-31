"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import SiteShell from "../components/SiteShell";

const pageWrap: React.CSSProperties = {
  maxWidth: "760px",
  margin: "0 auto",
  padding: "24px",
};

const heroCard: React.CSSProperties = {
  borderRadius: "28px",
  padding: "28px 30px",
  marginBottom: "20px",
  background: "linear-gradient(135deg, #1f4f82 0%, #2d8aa6 55%, #95c85b 100%)",
  color: "#ffffff",
  boxShadow: "0 14px 36px rgba(15, 23, 42, 0.12)",
};

const panelCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dbe4ee",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#1e3a5f",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cfd8e3",
  outline: "none",
  fontSize: "16px",
  color: "#0f172a",
  background: "#f8fafc",
  marginBottom: "16px",
  boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  background: "linear-gradient(135deg, #1f4f82 0%, #0f766e 100%)",
  color: "#ffffff",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  background: "#ffffff",
  color: "#1e3a5f",
};

const noticeStyle: React.CSSProperties = {
  marginTop: "14px",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "14px",
  lineHeight: 1.45,
};

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data.session) {
        router.replace("/me");
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorText("");

    try {
      if (!supabase) {
        setErrorText(
          "Supabase environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel and your local .env.local."
        );
        return;
      }

      if (!email.trim() || !password.trim()) {
        setErrorText("Enter both email and password.");
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorText(error.message);
          return;
        }

        setMessage("Login successful. Taking you to your profile...");
        router.push("/me");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorText(error.message);
          return;
        }

        setMessage(
          "Account created. If email confirmation is enabled in Supabase, confirm your email first. Otherwise you can sign in now."
        );
        setMode("signin");
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <div style={pageWrap}>
        <div style={heroCard}>
          <h1 style={{ margin: 0, fontSize: "46px", lineHeight: 1.05 }}>Login</h1>
          <p style={{ margin: "12px 0 0 0", fontSize: "20px", opacity: 0.96 }}>
            Personal sign-in for your profile, your events, and future role-based access.
          </p>
        </div>

        <div style={panelCard}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setMessage("");
                setErrorText("");
              }}
              style={{
                ...secondaryButton,
                background: mode === "signin" ? "#0f766e" : "#ffffff",
                color: mode === "signin" ? "#ffffff" : "#1e3a5f",
                borderColor: mode === "signin" ? "#0f766e" : "#cbd5e1",
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
                setErrorText("");
              }}
              style={{
                ...secondaryButton,
                background: mode === "signup" ? "#1f4f82" : "#ffffff",
                color: mode === "signup" ? "#ffffff" : "#1e3a5f",
                borderColor: mode === "signup" ? "#1f4f82" : "#cbd5e1",
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@drexel.edu"
              style={inputStyle}
            />

            <label style={labelStyle}>Password</label>
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "6px" }}>
              <button type="submit" disabled={loading} style={primaryButton}>
                {loading
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              </button>

              <Link
                href="/me"
                style={{
                  ...secondaryButton,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Go to My Profile
              </Link>
            </div>
          </form>

          {message ? (
            <div
              style={{
                ...noticeStyle,
                background: "#ecfdf5",
                color: "#166534",
                border: "1px solid #bbf7d0",
              }}
            >
              {message}
            </div>
          ) : null}

          {errorText ? (
            <div
              style={{
                ...noticeStyle,
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
              }}
            >
              {errorText}
            </div>
          ) : null}

          <div
            style={{
              marginTop: "18px",
              paddingTop: "18px",
              borderTop: "1px solid #e2e8f0",
              color: "#475569",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Use a real Supabase Auth account here. After sign-in, <strong>/me</strong> becomes your
            personal page and starts filtering events to you.
          </div>
        </div>
      </div>
    </SiteShell>
  );
}