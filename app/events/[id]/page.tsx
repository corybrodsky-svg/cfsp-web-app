"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import { events, sps, EventAssignment } from "../../lib/cfspData";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const foundEvent = events.find((e) => e.id === eventId);

  const [assignments, setAssignments] = useState<EventAssignment[]>([]);
  const [selectedSpId, setSelectedSpId] = useState("");

  // 🔥 HARD GUARD — NOTHING BELOW CAN RUN WITHOUT EVENT
  if (!foundEvent) {
    return (
      <SiteShell title="Event Not Found">
        <div style={{ padding: 20 }}>
          <h2>Event not found</h2>
          <Link href="/events">← Back to Events</Link>
        </div>
      </SiteShell>
    );
  }

  // 🔥 AFTER GUARD → SAFE
  const event = foundEvent;

  function addSP() {
    const sp = sps.find((s) => s.id === selectedSpId);
    if (!sp) return;

    const newAssign: EventAssignment = {
      id: crypto.randomUUID(),
      eventId: event.id,
      eventName: event.name,
      spId: sp.id,
      spName: sp.fullName,
      spEmail: sp.email,
      confirmed: false,
      createdAt: new Date().toISOString(),
    };

    setAssignments((prev) => [...prev, newAssign]);
  }

  function removeSP(id: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  function sendEmail() {
    const emails = assignments.map((a) => a.spEmail).join(",");

    const subject = encodeURIComponent(
      `${event.name} – Event Prep (${event.date})`
    );

    const body = encodeURIComponent(`
SPs,

Please review the following:

• Event: ${event.name}
• Date: ${event.date}
• Time: ${event.time}
• Location: ${event.location}

Thank you,
Cory
    `);

    window.location.href = `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;
  }

  return (
    <SiteShell title={event.name}>
      <div style={{ padding: 20 }}>

        <Link href="/events">← Back to Events</Link>

        <h1>{event.name}</h1>
        <p>{event.date} | {event.time}</p>

        <h3>Add SP</h3>
        <select
          value={selectedSpId}
          onChange={(e) => setSelectedSpId(e.target.value)}
        >
          <option value="">Select SP</option>
          {sps.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.fullName}
            </option>
          ))}
        </select>

        <button onClick={addSP} style={{ marginLeft: 10 }}>
          Add SP
        </button>

        <h3 style={{ marginTop: 20 }}>Assigned SPs</h3>

        {assignments.map((a) => (
          <div key={a.id}>
            {a.spName} ({a.spEmail})
            <button onClick={() => removeSP(a.id)} style={{ marginLeft: 10 }}>
              Remove
            </button>
          </div>
        ))}

        <button onClick={sendEmail} style={{ marginTop: 30 }}>
          Generate Event Email
        </button>

      </div>
    </SiteShell>
  );
}