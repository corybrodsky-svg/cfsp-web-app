"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type EventDetailRow = {
  id: string;
  name: string | null;
  status: string | null;
  date_text: string | null;
  sp_needed: number | null;
  sp_assigned: number | null;
  visibility: string | null;
  created_at: string | null;
  location: string | null;
  zoom_link: string | null;
  training_info: string | null;
  faculty_contact: string | null;
  notes: string | null;
};

const pageStyle: React.CSSProperties = {
  maxWidth: "980px",
  margin: "0 auto",
  padding: "24px",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#111827",
};

const topLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "18px",
  textDecoration: "none",
  color: "#1d4ed8",
  fontWeight: 700,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d8e0ee",
  borderRadius: "18px",
  padding: "24px",
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const titleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "22px",
  fontSize: "34px",
  lineHeight: 1.1,
  fontWeight: 800,
  color: "#0f172a",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

const infoBoxStyle: React.CSSProperties = {
  border: "1px solid #dbe4f0",
  borderRadius: "16px",
  padding: "14px 16px",
  background: "#f8fafc",
};

const fullRowStyle: React.CSSProperties = {
  ...infoBoxStyle,
  gridColumn: "1 / -1",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const valueStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#111827",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.45,
};

const pillStyle = (status: string | null): React.CSSProperties => ({
  display: "inline-block",
  marginBottom: "18px",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "14px",
  fontWeight: 800,
  border:
    (status ?? "").toLowerCase() === "complete"
      ? "1px solid #86efac"
      : "1px solid #cbd5e1",
  background:
    (status ?? "").toLowerCase() === "complete" ? "#ecfdf3" : "#f8fafc",
  color:
    (status ?? "").toLowerCase() === "complete" ? "#15803d" : "#334155",
});

function textOrDash(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "—";
  const s = String(value).trim();
  return s ? s : "—";
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : (raw as string | undefined);
  }, [params]);

  const [event, setEvent] = useState<EventDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setError("No event ID was provided.");
        setEvent(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("events")
        .select(
          `
            id,
            name,
            status,
            date_text,
            sp_needed,
            sp_assigned,
            visibility,
            created_at,
            location,
            zoom_link,
            training_info,
            faculty_contact,
            notes
          `
        )
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error loading event:", error);
        setError(error.message || "Could not load event.");
        setEvent(null);
      } else {
        setEvent(data as EventDetailRow);
      }

      setLoading(false);
    }

    loadEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <Link href="/" style={topLinkStyle}>
          ← Back to Dashboard
        </Link>

        <div style={cardStyle}>Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <Link href="/" style={topLinkStyle}>
          ← Back to Dashboard
        </Link>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Could not load event</h2>
          <p style={{ color: "#b91c1c", marginBottom: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={pageStyle}>
        <Link href="/" style={topLinkStyle}>
          ← Back to Dashboard
        </Link>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Event not found</h2>
          <p style={{ marginBottom: 0 }}>The requested event could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Link href="/" style={topLinkStyle}>
        ← Back to Dashboard
      </Link>

      <div style={cardStyle}>
        <h1 style={titleStyle}>{textOrDash(event.name || "Untitled Event")}</h1>

        <div style={pillStyle(event.status)}>{textOrDash(event.status || "—")}</div>

        <div style={infoGridStyle}>
          <div style={infoBoxStyle}>
            <div style={labelStyle}>Date(s)</div>
            <div style={valueStyle}>{textOrDash(event.date_text)}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>Visibility</div>
            <div style={valueStyle}>{textOrDash(event.visibility)}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>SP Needed</div>
            <div style={valueStyle}>{textOrDash(event.sp_needed ?? 0)}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>SP Assigned</div>
            <div style={valueStyle}>{textOrDash(event.sp_assigned ?? 0)}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>Location</div>
            <div style={valueStyle}>{textOrDash(event.location)}</div>
          </div>

          <div style={infoBoxStyle}>
            <div style={labelStyle}>Zoom Link</div>
            <div style={valueStyle}>
              {event.zoom_link ? (
                <a href={event.zoom_link} target="_blank" rel="noreferrer">
                  {event.zoom_link}
                </a>
              ) : (
                "—"
              )}
            </div>
          </div>

          <div style={fullRowStyle}>
            <div style={labelStyle}>Training Info</div>
            <div style={valueStyle}>{textOrDash(event.training_info)}</div>
          </div>

          <div style={fullRowStyle}>
            <div style={labelStyle}>Faculty Contact</div>
            <div style={valueStyle}>{textOrDash(event.faculty_contact)}</div>
          </div>

          <div style={fullRowStyle}>
            <div style={labelStyle}>Notes</div>
            <div style={valueStyle}>{textOrDash(event.notes)}</div>
          </div>

          <div style={fullRowStyle}>
            <div style={labelStyle}>Created</div>
            <div style={valueStyle}>
              {event.created_at
                ? new Date(event.created_at).toLocaleString()
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}