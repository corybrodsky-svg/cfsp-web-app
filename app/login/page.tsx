"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ... } from "../lib/demoAuth";
export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("Drexel1$");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const existing = getSession();
    if (!existing) return;

    if (existing.role === "sp") router.replace("/profile");
    else router.replace("/dashboard");
  }, [router]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const result = loginUser(login, password);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage(`Welcome back, ${result.user.firstName}.`);

    window.setTimeout(() => {
      if (result.user.role === "sp") router.push("/profile");
      else router.push("/dashboard");
    }, 600);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>CFSP Login</h1>
        <p style={styles.subtitle}>
          Sign in with your email or username.
        </p>

        <div style={styles.demoBox}>
          <div style={styles.demoTitle}>Built-in test accounts</div>
          <div style={styles.demoLine}>Admin: <strong>admin@cfsp.local</strong> / <strong>Drexel1$</strong></div>
          <div style={styles.demoLine}>Sim Op: <strong>simop@cfsp.local</strong> / <strong>Drexel1$</strong></div>
          <div style={styles.demoLine}>SP: <strong>sp@cfsp.local</strong> / <strong>Drexel1$</strong></div>
        </div>

        {message ? <div style={styles.success}>{message}</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email or Username</label>
            <input
              style={styles.input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin@cfsp.local or cbrodsky"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Drexel1$"
            />
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.primaryButton}>
              Log In
            </button>

            <Link href="/create-account" style={styles.secondaryLink}>
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f7fb",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "#ffffff",
    border: "1px solid #d8e0ec",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 10px 30px rgba(19, 40, 72, 0.08)",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 800,
    color: "#183153",
  },
  subtitle: {
    margin: "10px 0 18px 0",
    color: "#5f7183",
    fontSize: "15px",
  },
  demoBox: {
    marginBottom: "18px",
    border: "1px solid #d8e0ec",
    borderRadius: "14px",
    padding: "14px",
    background: "#f8fbff",
  },
  demoTitle: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#183153",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  demoLine: {
    fontSize: "14px",
    color: "#334155",
    marginBottom: "6px",
  },
  success: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    border: "1px solid #bbf7d0",
  },
  error: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    border: "1px solid #fecaca",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#334155",
  },
  input: {
    height: "46px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "0 12px",
    fontSize: "14px",
    background: "#fff",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: "6px",
  },
  primaryButton: {
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    background: "#fff",
    color: "#183153",
    border: "1px solid #d8e0ec",
    fontWeight: 700,
  },
};