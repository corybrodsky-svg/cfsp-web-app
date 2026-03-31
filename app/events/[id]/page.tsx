"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SiteShell from "../../components/SiteShell";
import * as planningData from "../../lib/planningData";

type AnyRecord = Record<string, any>;

type EventHire = {
  id: string;
  eventId: string;
  spName: string;
  confirmed: boolean;
};

const STORAGE_KEY = "cfsp-event-sp-hires-v1";

function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function slugify(value: string): string {
  return safeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractRows(moduleLike: AnyRecord): AnyRecord[] {
  const rows: AnyRecord[] = [];

  Object.values(moduleLike).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((row) => {
        if (row && typeof row === "object") rows.push(row);
      });
    }
  });

  return rows;
}

function loadHires(): EventHire[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function chipStyle(confirmed: boolean): React.CSSProperties {
  return confirmed
    ? {
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid #000",
        color: "#000",
        fontWeight: 800,
      }
    : {
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid #dc2626",
        color: "#dc2626",
        background: "#fff1f2",
        fontWeight: 800,
      };
}

export default function EventDetailPage() {
  const params = useParams();
  const rawId = safeString(params?.id);

  const [hires, setHires] = useState<EventHire[]>([]);

  useEffect(() => {
    setHires(loadHires());
  }, []);

  const event = useMemo(() => {
    const rows = extractRows(planningData as AnyRecord);

    return rows.find((row) => {
      const name =
        safeString(row.name) ||
        safeString(row.title) ||
        safeString(row.event_name) ||
        safeString(row.eventName);

      return slugify(name) === slugify(rawId);
    });
  }, [rawId]);

  const hiresForEvent = hires.filter(
    (h) => slugify(h.eventId) === slugify(rawId)
  );

  const confirmed = hiresForEvent.filter((h) => h.confirmed).length;

  if (!event) {
    return (
      <SiteShell>
        <div style={{ padding: 30 }}>
          <h2>Event not found</h2>
          <Link href="/events">Back</Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div style={{ padding: 30 }}>
        <Link href="/events">← Back</Link>

        <h1 style={{ fontSize: 32, marginTop: 10 }}>
          {safeString(event.name)}
        </h1>

        <div style={{ marginTop: 10 }}>
          <strong>Date:</strong> {safeString(event.date_text) || "—"}
        </div>

        <div style={{ marginTop: 20 }}>
          <strong>SP Coverage:</strong>{" "}
          {hiresForEvent.length} total | {confirmed} confirmed
        </div>

        <div style={{ marginTop: 20 }}>
          <strong>SP Roster</strong>

          {hiresForEvent.length === 0 ? (
            <div style={{ marginTop: 10 }}>No SPs added yet.</div>
          ) : (
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {hiresForEvent.map((hire) => (
                <span key={hire.id} style={chipStyle(hire.confirmed)}>
                  {hire.spName}{" "}
                  {hire.confirmed ? "(Confirmed)" : "(Pending)"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}