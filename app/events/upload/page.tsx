"use client";

import Link from "next/link";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eef4fb 0%, #dfe8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "960px",
  margin: "0 auto",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "24px",
  border: "1px solid #d8e3f1",
  boxShadow: "0 12px 28px rgba(20, 40, 90, 0.08)",
};

export default function UploadPage() {
  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0, color: "#12233f" }}>Upload Session Details</h1>
          <p style={{ color: "#61748d", lineHeight: 1.7 }}>
            This is the next build step. We will connect a Word document uploader here and turn your
            session details file into a draft event by extracting values after your keywords.
          </p>

          <div style={{ marginTop: "16px" }}>
            <Link
              href="/admin"
              style={{
                display: "inline-block",
                padding: "12px 16px",
                borderRadius: "14px",
                background: "#173d70",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}