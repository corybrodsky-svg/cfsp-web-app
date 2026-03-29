"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addOrReplaceAssignment,
  AssignmentDraft,
  buildUsername,
  DEFAULT_PASSWORD,
  events,
  getStoredAssignments,
  PoolType,
  sps as mockSPs,
} from "../lib/mockData";

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

type DirectorySP = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  workingEmail: string;
  secondaryEmail: string;
  phone: string;
  secondaryPhone: string;
  portrayalAge: string;
  race: string;
  sex: string;
  doNotHireFor: string;
  telehealth: string;
  ptPreferred: string;
  otherRoles: string;
  birthYear: string;
  speaksSpanish: string;
  username: string;
  defaultPassword: string;
  pool: PoolType;
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eef4fb 0%, #dde8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1320px",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #173d70 0%, #1f4e8d 100%)",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 18px 40px rgba(18, 35, 63, 0.22)",
  marginBottom: "18px",
};

const heroTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  alignItems: "flex-start",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "34px",
  fontWeight: 900,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "rgba(255,255,255,0.82)",
  fontSize: "15px",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const lightButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "14px",
  background: "#ffffff",
  color: "#173d70",
  fontWeight: 800,
  border: "1px solid rgba(255,255,255,0.2)",
};

const darkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.15)",
  color: "#ffffff",
  fontWeight: 800,
  border: "1px solid rgba(255,255,255,0.22)",
};

const toolbarStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8e3f1",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 12px 28px rgba(20, 40, 90, 0.08)",
  marginBottom: "18px",
};

const searchStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: "16px",
  border: "1px solid #cfd9e8",
  fontSize: "15px",
  boxSizing: "border-box",
  background: "#fbfdff",
};

const filterRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const pillStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f3f7fc",
  border: "1px solid #d7e1ee",
  fontSize: "13px",
  fontWeight: 800,
  color: "#35506f",
  cursor: "pointer",
};

const activePillStyle: React.CSSProperties = {
  ...pillStyle,
  background: "#173d70",
  color: "#ffffff",
  border: "1px solid #173d70",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid #d9e3f1",
  boxShadow: "0 14px 28px rgba(20, 40, 90, 0.08)",
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
  fontSize: "26px",
  fontWeight: 900,
  color: "#12233f",
};

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#edf4fb",
  border: "1px solid #d9e3f1",
  color: "#173d70",
  fontWeight: 800,
  fontSize: "13px",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginTop: "16px",
};

const infoCardStyle: React.CSSProperties = {
  border: "1px solid #dde6f2",
  borderRadius: "16px",
  padding: "14px",
  background: "#f8fbff",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
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
  borderRadius: "16px",
  padding: "14px",
  background: "#fcfdff",
};

const assignPanelStyle: React.CSSProperties = {
  marginTop: "18px",
  border: "1px solid #dce6f2",
  borderRadius: "18px",
  padding: "16px",
  background: "linear-gradient(180deg, #f8fbff 0%, #f1f7fd 100%)",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #cdd8e8",
  background: "#ffffff",
  cursor: "pointer",
  fontWeight: 800,
  color: "#173d70",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#173d70",
  color: "#ffffff",
  border: "1px solid #173d70",
};

const successStyle: React.CSSProperties = {
  ...cardStyle,
  marginBottom: "16px",
  border: "1px solid #b7dfc4",
  background: "#edf9f0",
  color: "#14532d",
  fontWeight: 800,
};

const errorStyle: React.CSSProperties = {
  ...cardStyle,
  marginBottom: "16px",
  border: "1px solid #f0c7c7",
  background: "#fff4f4",
  color: "#9f1239",
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  fontSize: "14px",
  boxSizing: "border-box",
  background: "#ffffff",
};

const selectStyle: React.CSSProperties = inputStyle;

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

function poolForSP(fullName: string): PoolType {
  const found = mockSPs.find(
    (sp) => sp.fullName.trim().toLowerCase() === fullName.trim().toLowerCase()
  );
  return found?.pool || "CICSP";
}

function toDirectorySP(row: SPRow): DirectorySP {
  const fullName = `${row.first_name} ${row.last_name}`.trim();
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName,
    workingEmail: row.working_email,
    secondaryEmail: row.secondary_email,
    phone: row.phone,
    secondaryPhone: row.secondary_phone,
    portrayalAge: row.portrayal_age,
    race: row.race,
    sex: row.sex,
    doNotHireFor: row.do_not_hire_for,
    telehealth: row.telehealth,
    ptPreferred: row.pt_preferred,
    otherRoles: row.other_roles,
    birthYear: row.birth_year,
    speaksSpanish: row.speaks_spanish,
    username: buildUsername(fullName),
    defaultPassword: DEFAULT_PASSWORD,
    pool: poolForSP(fullName),
  };
}

export default function SPDirectoryPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<DirectorySP[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [poolFilter, setPoolFilter] = useState<"All" | PoolType>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<"existing" | "placeholder">("existing");
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [placeholderName, setPlaceholderName] = useState("");
  const [placeholderDate, setPlaceholderDate] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [assignments, setAssignments] = useState<AssignmentDraft[]>([]);

  useEffect(() => {
    setAssignments(getStoredAssignments());
  }, []);

  useEffect(() => {
    async function loadCSV() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/cfsp_sps_import_v3.csv", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load /cfsp_sps_import_v3.csv.");
        }

        const text = await response.text();
        const parsedRows = toSPRows(text).map(toDirectorySP);
        setRows(parsedRows);
      } catch (error) {
        console.error(error);

        const fallbackRows = mockSPs.map((sp) => {
          const [firstName = "", ...rest] = sp.fullName.split(" ");
          const lastName = rest.join(" ");

          return {
            id: sp.id,
            firstName,
            lastName,
            fullName: sp.fullName,
            workingEmail: sp.email,
            secondaryEmail: "",
            phone: sp.phone,
            secondaryPhone: "",
            portrayalAge: sp.portrayalAge,
            race: sp.raceSex.split("/")[0]?.trim() || "",
            sex: sp.raceSex.split("/")[1]?.trim() || "",
            doNotHireFor: "",
            telehealth: "",
            ptPreferred: "",
            otherRoles: "",
            birthYear: "",
            speaksSpanish: "",
            username: sp.username,
            defaultPassword: sp.defaultPassword,
            pool: sp.pool,
          } satisfies DirectorySP;
        });

        setRows(fallbackRows);
        setErrorMessage(
          "CSV not found in public folder. Showing fallback directory data for now."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCSV();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((sp) => {
      const matchesPool = poolFilter === "All" ? true : sp.pool === poolFilter;

      const matchesQuery =
        !q ||
        [
          sp.firstName,
          sp.lastName,
          sp.fullName,
          sp.workingEmail,
          sp.secondaryEmail,
          sp.phone,
          sp.secondaryPhone,
          sp.portrayalAge,
          sp.race,
          sp.sex,
          sp.doNotHireFor,
          sp.telehealth,
          sp.ptPreferred,
          sp.otherRoles,
          sp.birthYear,
          sp.speaksSpanish,
          sp.username,
          sp.pool,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchesPool && matchesQuery;
    });
  }, [rows, query, poolFilter]);

  function assignmentCountForSP(spId: string) {
    return assignments.filter((item) => item.spId === spId).length;
  }

  function saveAssignment(sp: DirectorySP) {
    setSavedMessage("");
    setErrorMessage("");

    if (assignMode === "placeholder" && !placeholderName.trim()) {
      setErrorMessage("Placeholder event name is required.");
      setTimeout(() => setErrorMessage(""), 2200);
      return;
    }

    const selectedEvent = events.find((event) => event.id === selectedEventId);

    const draft: AssignmentDraft = {
      id: `${sp.id}-${Date.now()}`,
      spId: sp.id,
      spName: sp.fullName,
      eventMode: assignMode,
      eventId: assignMode === "existing" ? selectedEvent?.id : undefined,
      eventName:
        assignMode === "existing"
          ? selectedEvent?.name || "Unknown Event"
          : placeholderName.trim(),
      dateText:
        assignMode === "existing"
          ? selectedEvent?.dateText || ""
          : placeholderDate.trim(),
      notes: assignmentNote.trim(),
      createdAt: new Date().toISOString(),
    };

    const next = addOrReplaceAssignment(draft);
    setAssignments(next);
    window.dispatchEvent(new Event("cfsp-assignments-updated"));
    setSavedMessage(`${sp.fullName} assigned to ${draft.eventName}.`);
    setAssignmentNote("");
    setPlaceholderName("");
    setPlaceholderDate("");
    setTimeout(() => setSavedMessage(""), 2200);
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div style={heroTopStyle}>
            <div>
              <h1 style={titleStyle}>SP Directory</h1>
              <div style={subtitleStyle}>
                Search, filter, assign, and manage standardized patients.
              </div>
            </div>

            <div style={actionRowStyle}>
              <Link href="/" style={lightButtonStyle}>Home</Link>
              <Link href="/admin" style={lightButtonStyle}>Admin</Link>
              <Link href="/events" style={lightButtonStyle}>Events</Link>
              <Link href="/login" style={darkButtonStyle}>Login</Link>
            </div>
          </div>
        </div>

        <div style={toolbarStyle}>
          <input
            type="text"
            placeholder="Search by name, username, email, phone, portrayal age, race, sex, roles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchStyle}
          />

          <div style={filterRowStyle}>
            {(["All", "CICSP", "Elkins Park", "Both"] as const).map((item) => (
              <button
                key={item}
                type="button"
                style={poolFilter === item ? activePillStyle : pillStyle}
                onClick={() => setPoolFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div style={filterRowStyle}>
            <span style={pillStyle}>Loaded: {loading ? "..." : rows.length}</span>
            <span style={pillStyle}>Showing: {loading ? "..." : filtered.length}</span>
            <span style={pillStyle}>Assignments: {assignments.length}</span>
          </div>
        </div>

        {savedMessage ? <div style={successStyle}>{savedMessage}</div> : null}
        {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

        {loading ? (
          <div style={cardStyle}>Loading SP directory...</div>
        ) : filtered.length === 0 ? (
          <div style={cardStyle}>No results found.</div>
        ) : (
          <div style={gridStyle}>
            {filtered.map((sp) => (
              <div key={sp.id} style={cardStyle}>
                <div style={cardTopStyle}>
                  <h2 style={nameStyle}>{sp.fullName || "Unnamed SP"}</h2>

                  <div style={badgeRowStyle}>
                    <div style={badgeStyle}>{sp.pool}</div>
                    <div style={badgeStyle}>{sp.portrayalAge || "Age N/A"}</div>
                    <div style={badgeStyle}>{assignmentCountForSP(sp.id)} assigned</div>
                  </div>
                </div>

                <div style={infoGridStyle}>
                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Username</div>
                    <p style={valueStyle}>{sp.username || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Default Password</div>
                    <p style={valueStyle}>{sp.defaultPassword}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Working Email</div>
                    <p style={valueStyle}>{sp.workingEmail || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Phone</div>
                    <p style={valueStyle}>{sp.phone || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Secondary Email</div>
                    <p style={valueStyle}>{sp.secondaryEmail || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Secondary Phone</div>
                    <p style={valueStyle}>{sp.secondaryPhone || "—"}</p>
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
                    <p style={valueStyle}>{sp.ptPreferred || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Other Roles</div>
                    <p style={valueStyle}>{sp.otherRoles || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Birth Year</div>
                    <p style={valueStyle}>{sp.birthYear || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Speaks Spanish</div>
                    <p style={valueStyle}>{sp.speaksSpanish || "—"}</p>
                  </div>
                </div>

                <div style={noteBlockStyle}>
                  <div style={labelStyle}>Do Not Hire For</div>
                  <p style={valueStyle}>{sp.doNotHireFor || "—"}</p>
                </div>

                <div style={buttonRowStyle}>
                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => setExpandedId(expandedId === sp.id ? null : sp.id)}
                  >
                    {expandedId === sp.id ? "Hide Assignment" : "Assign to Event"}
                  </button>
                </div>

                {expandedId === sp.id ? (
                  <div style={assignPanelStyle}>
                    <div style={filterRowStyle}>
                      <button
                        type="button"
                        style={assignMode === "existing" ? activePillStyle : pillStyle}
                        onClick={() => setAssignMode("existing")}
                      >
                        Existing Event
                      </button>

                      <button
                        type="button"
                        style={assignMode === "placeholder" ? activePillStyle : pillStyle}
                        onClick={() => setAssignMode("placeholder")}
                      >
                        Placeholder Event
                      </button>
                    </div>

                    {assignMode === "existing" ? (
                      <div style={{ marginTop: "14px" }}>
                        <div style={labelStyle}>Select Event</div>
                        <select
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          style={selectStyle}
                        >
                          {events.map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name} — {event.dateText}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginTop: "14px" }}>
                          <div style={labelStyle}>Placeholder Event Name</div>
                          <input
                            value={placeholderName}
                            onChange={(e) => setPlaceholderName(e.target.value)}
                            style={inputStyle}
                            placeholder="Example: PA Spring OSCE B"
                          />
                        </div>

                        <div style={{ marginTop: "14px" }}>
                          <div style={labelStyle}>Date / Date Text</div>
                          <input
                            value={placeholderDate}
                            onChange={(e) => setPlaceholderDate(e.target.value)}
                            style={inputStyle}
                            placeholder="Example: 4/15 and 4/21"
                          />
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: "14px" }}>
                      <div style={labelStyle}>Assignment Notes</div>
                      <input
                        value={assignmentNote}
                        onChange={(e) => setAssignmentNote(e.target.value)}
                        style={inputStyle}
                        placeholder="Optional notes"
                      />
                    </div>

                    <div style={buttonRowStyle}>
                      <button
                        type="button"
                        style={primaryButtonStyle}
                        onClick={() => saveAssignment(sp)}
                      >
                        Save Assignment
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}