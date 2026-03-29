import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import { events } from "../../lib/mockData";

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #d8e0ec",
  padding: "12px",
  textAlign: "left",
};

export default function UploadPage() {
  return (
    <SiteShell title="Upload Events" subtitle="Temporary upload/testing page.">
      <div style={{ marginBottom: "16px" }}>
        <Link href="/events/new">+ Create New Event</Link>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Event</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Dates</th>
            <th style={cellStyle}>SP Needed</th>
            <th style={cellStyle}>SP Assigned</th>
            <th style={cellStyle}>Open</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td style={cellStyle}>{event.name}</td>
              <td style={cellStyle}>{event.status}</td>
              <td style={cellStyle}>{event.dateText}</td>
              <td style={cellStyle}>{event.spNeeded}</td>
              <td style={cellStyle}>{event.spAssigned}</td>
              <td style={cellStyle}>
                <Link href={`/events/${event.id}`}>View Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SiteShell>
  );
}