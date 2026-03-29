"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUser, UserRole } from "../lib/demoAuth";

export default function CreateAccountPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Drexel1$");
  const [role, setRole] = useState<UserRole>("sp");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const result = createUser({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage(
      `Account created for ${result.user.firstName} ${result.user.lastName}. Username: ${result.user.username}`
    );

    window.setTimeout(() => {
      if (result.user.role === "admin") router.push("/dashboard");
      else if (result.user.role === "sim-op") router.push("/dashboard");
      else router.push("/profile");
    }, 900);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>
          Create an Admin, Sim Op, or SP account that works right now.
        </p>

        {message ? <div style={styles.success}>{message}</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <form onSubmit={handleCreateAccount} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input
                style={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Cory"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input
                style={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Brodsky"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
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

            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.input}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="admin">Administrator</option>
                <option value="sim-op">Sim Op</option>
                <option value="sp">SP</option>
              </select>
            </div>
          </div>

          <div style={styles.note}>
            Username is auto-generated as first initial + last name.
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.primaryButton}>
              Create Account
            </button>

            <Link href="/login" style={styles.secondaryLink}>
              Back to Login
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
    maxWidth: "680px",
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
    margin: "10px 0 20px 0",
    color: "#5f7183",
    fontSize: "15px",
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
    gap: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
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
    height: "44px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "0 12px",
    fontSize: "14px",
    background: "#fff",
  },
  note: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
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