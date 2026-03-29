"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SPRow = {
  id: string;
  last_name: string;
  first_name: string;
  working_email: string;
  phone: string;
  secondary_phone: string;
  portrayal_age: string;
  race: string;
  sex: string;
  do_not_hire_for: string;
  telehealth: string;
  pt_preferred: string;
  other_roles: string;
  birth_year: string;
  secondary_email: string;
  speaks_spanish: string;
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #f4f7fb 0%, #e8eef7 45%, #dfe8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 800,
  color: "#12233f",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#62748d",
  fontSize: "15px",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#173d70",
  color: "#ffffff",
  fontWeight: 800,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#ffffff",
  border: "1px solid #d0dae8",
  color: "#173d70",
  fontWeight: 800,
};

const toolbarStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d9e3f1",
  borderRadius: "18px",
  padding: "18px",
  boxShadow: "0 10px 26px rgba(20, 40, 90, 0.08)",
  marginBottom: "18px",
};

const searchStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  fontSize: "15px",
  background: "#fbfcfe",
  boxSizing: "border-box",
};

const statRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const pillStyle: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "#f2f6fc",
  border: "1px solid #d9e3f1",
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid #d9e3f1",
  boxShadow: "0 10px 26px rgba(20, 40, 90, 0.08)",
};

const cardTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "24px",
  fontWeight: 800,
  color: "#12233f",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#eef4fb",
  border: "1px solid #d9e3f1",
  color: "#173d70",
  fontWeight: 800,
  fontSize: "13px",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginTop: "14px",
};

const infoCardStyle: React.CSSProperties = {
  border: "1px solid #dde6f2",
  borderRadius: "14px",
  padding: "14px",
  background: "#f8fbff",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#6b7c93",
  marginBottom: "6px",
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  color: "#24364d",
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const noteBlockStyle: React.CSSProperties = {
  marginTop: "14px",
  border: "1px solid #dde6f2",
  borderRadius: "14px",
  padding: "14px",
  background: "#fcfdff",
};

function normalizeHeader(header: string) {
  return header.replace(/^\uFEFF/, "").trim();
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function toSPRows(csvText: string): SPRow[] {
  const parsed = parseCSV(csvText);
  if (!parsed.length) return [];

  const headers = parsed[0].map(normalizeHeader);

  return parsed.slice(1).map((cells, index) => {
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = (cells[i] || "").trim();
    });

    return {
      id: `${record.last_name || "sp"}-${record.first_name || "row"}-${index}`,
      last_name: record.last_name || "",
      first_name: record.first_name || "",
      working_email: record.working_email || "",
      phone: record.phone || "",
      secondary_phone: record.secondary_phone || "",
      portrayal_age: record.portrayal_age || "",
      race: record.race || "",
      sex: record.sex || "",
      do_not_hire_for: record.do_not_hire_for || "",
      telehealth: record.telehealth || "",
      pt_preferred: record.pt_preferred || "",
      other_roles: record.other_roles || "",
      birth_year: record.birth_year || "",
      secondary_email: record.secondary_email || "",
      speaks_spanish: record.speaks_spanish || "",
    };
  });
}

export default function SPDirectoryPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<SPRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCSV() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/cfsp_sps_import_v3.csv", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Could not load /cfsp_sps_import_v3.csv from the public folder."
          );
        }

        const text = await response.text();
        const parsedRows = toSPRows(text);
        setRows(parsedRows);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "SP CSV not found yet. Put cfsp_sps_import_v3.csv into your public folder."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCSV();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((sp) =>
      [
        sp.first_name,
        sp.last_name,
        sp.working_email,
        sp.secondary_email,
        sp.phone,
        sp.secondary_phone,
        sp.portrayal_age,
        sp.race,
        sp.sex,
        sp.do_not_hire_for,
        sp.telehealth,
        sp.pt_preferred,
        sp.other_roles,
        sp.birth_year,
        sp.speaks_spanish,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={topRowStyle}>
          <div>
            <h1 style={titleStyle}>SP Directory</h1>
            <div style={subtitleStyle}>
              Search and review standardized patient records.
            </div>
          </div>

          <div style={actionRowStyle}>
            <Link href="/" style={secondaryLinkStyle}>
              Dashboard
            </Link>
            <Link href="/events" style={secondaryLinkStyle}>
              Events
            </Link>
            <Link href="/login" style={primaryLinkStyle}>
              Login
            </Link>
          </div>
        </div>

        <div style={toolbarStyle}>
          <input
            type="text"
            placeholder="Search by name, email, phone, portrayal age, race, sex, telehealth, roles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchStyle}
          />

          <div style={statRowStyle}>
            <span style={pillStyle}>
              Total Loaded: {loading ? "..." : rows.length}
            </span>
            <span style={pillStyle}>
              Showing: {loading ? "..." : filtered.length}
            </span>
            <span style={pillStyle}>Source: CSV import</span>
          </div>
        </div>

        {loading ? (
          <div style={cardStyle}>Loading SP directory...</div>
        ) : errorMessage ? (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#12233f" }}>CSV not loaded yet</h3>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>{errorMessage}</p>
            <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: 0 }}>
              Put your attached file in:
              <br />
              <strong>public/cfsp_sps_import_v3.csv</strong>
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#12233f" }}>No results</h3>
            <p style={{ color: "#475569", marginBottom: 0 }}>
              Try a broader search term.
            </p>
          </div>
        ) : (
          <div style={gridStyle}>
            {filtered.map((sp) => {
              const fullName = `${sp.first_name} ${sp.last_name}`.trim();

              return (
                <div key={sp.id} style={cardStyle}>
                  <div style={cardTopStyle}>
                    <h2 style={nameStyle}>{fullName || "Unnamed SP"}</h2>
                    <div style={badgeStyle}>
                      {sp.portrayal_age || "Age N/A"}
                    </div>
                  </div>

                  <div style={infoGridStyle}>
                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Working Email</div>
                      <p style={valueStyle}>{sp.working_email || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Phone</div>
                      <p style={valueStyle}>{sp.phone || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Secondary Email</div>
                      <p style={valueStyle}>{sp.secondary_email || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Secondary Phone</div>
                      <p style={valueStyle}>{sp.secondary_phone || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Race</div>
                      <p style={valueStyle}>{sp.race || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Sex</div>
                      <p style={valueStyle}>{sp.sex || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Telehealth</div>
                      <p style={valueStyle}>{sp.telehealth || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>PT Preferred</div>
                      <p style={valueStyle}>{sp.pt_preferred || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Other Roles</div>
                      <p style={valueStyle}>{sp.other_roles || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Birth Year</div>
                      <p style={valueStyle}>{sp.birth_year || "—"}</p>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={labelStyle}>Speaks Spanish</div>
                      <p style={valueStyle}>{sp.speaks_spanish || "—"}</p>
                    </div>
                  </div>

                  <div style={noteBlockStyle}>
                    <div style={labelStyle}>Do Not Hire For</div>
                    <p style={valueStyle}>{sp.do_not_hire_for || "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}