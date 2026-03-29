"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "../lib/auth";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #eef4fb 0%, #dfe8f5 100%)",
  padding: "24px",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "460px",
  background: "#ffffff",
  border: "1px solid #d8e3f1",
  borderRadius: "22px",
  padding: "28px",
  boxShadow: "0 18px 40px rgba(18, 35, 63, 0.12)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#12233f",
  fontSize: "32px",
  fontWeight: 900,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "#5f728c",
  lineHeight: 1.6,
};

const labelStyle: React.CSSProperties = {
  marginTop: "16px",
  marginBottom: "6px",
  fontWeight: 800,
  color: "#35506f",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cfd7e6",
  boxSizing: "border-box",
  fontSize: "15px",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "18px",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "none",
  background: "#173d70",
  color: "#ffffff",
  fontWeight: 900,
  fontSize: "16px",
  cursor: "pointer",
};

const footerLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: "16px",
  textDecoration: "none",
  color: "#173d70",
  fontWeight: 800,
};

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("Drexel1$");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const result = loginUser(login, password);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(`Logged in as ${result.user.fullName} (${result.user.role}).`);

    if (result.user.role === "sim_op") {
      router.push("/admin");
      return;
    }

    router.push("/me");
  }

  return (
    <div style={pageStyle}>
      <form style={cardStyle} onSubmit={handleLogin}>
        <h1 style={titleStyle}>CFSP Login</h1>
        <div style={subtitleStyle}>
          Log in with email or username. Sim Ops go to admin. SPs go to their own page.
        </div>

        <div style={labelStyle}>Email or Username</div>
        <input
          style={inputStyle}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="cwb55@drexel.edu or cory.brodsky@gmail.com"
        />

        <div style={labelStyle}>Password</div>
        <input
          type="password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Drexel1$"
        />

        <button type="submit" style={buttonStyle}>
          Log In
        </button>

        {errorMessage ? (
          <div style={{ marginTop: "14px", color: "#c62828", fontWeight: 700 }}>
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div style={{ marginTop: "14px", color: "#1b5e20", fontWeight: 700 }}>
            {successMessage}
          </div>
        ) : null}

        <Link href="/" style={footerLinkStyle}>
          Back to Home
        </Link>
      </form>
    </div>
  );
}