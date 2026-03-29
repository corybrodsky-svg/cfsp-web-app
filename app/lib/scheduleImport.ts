export type ImportedSession = {
  id: string;
  date: string;
  eventName: string;
  room: string;
  roomRaw: string;
  startTime: string;
  endTime: string;
  timeRaw: string;
  employees: string[];
  lead: string;
  sourceRow: number;
};

export type ImportedEvent = {
  id: string;
  name: string;
  status: "Draft" | "Needs SPs" | "Scheduled" | "In Progress" | "Completed" | "Canceled";
  date_text: string;
  sp_needed: number;
  sp_assigned: number;
  notes: string;
  updated_at: string;
  assignedSimOps: string[];
  leadSimOps: string[];
  sessions: ImportedSession[];
};

type RowLike = Array<string | number | null | undefined>;

const EVENTS_KEY = "cfsp_events_v1";
const USERS_KEY = "cfsp_demo_users_v1";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
}

function canonicalizeEmployeeName(name: string): string {
  const cleaned = normalizeSpaces(
    name
      .replace(/\(.*?\)/g, "")
      .replace(/\blead\b/gi, "")
      .replace(/\bset\s*up\s*only\b/gi, "")
      .replace(/\bsetup\s*only\b/gi, "")
  );

  if (!cleaned) return "";

  const lower = cleaned.toLowerCase();
  if (lower === "pat") return "Patrick";
  if (lower === "jp") return "JP";

  return cleaned
    .split(" ")
    .map((part) => {
      if (!part) return part;
      if (part.toUpperCase() === "JP") return "JP";
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function splitEmployees(raw: string): string[] {
  if (!raw) return [];

  const prepared = raw
    .replace(/\n/g, "/")
    .replace(/\band\b/gi, "/")
    .replace(/&/g, "/")
    .replace(/,/g, "/")
    .replace(/;/g, "/");

  const pieces = prepared
    .split("/")
    .map((piece) => canonicalizeEmployeeName(piece))
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];

  for (const piece of pieces) {
    const key = piece.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(piece);
    }
  }

  return out;
}

function usernameFromName(name: string) {
  const parts = normalizeSpaces(name).split(" ").filter(Boolean);
  if (parts.length === 0) return "user";
  if (parts.length === 1) return parts[0].toLowerCase();
  return `${parts[0][0]}${parts[parts.length - 1]}`.toLowerCase();
}

function tryParseDateHeader(text: string): Date | null {
  const value = normalizeSpaces(text);
  if (!value) return null;
  if (/^week\b/i.test(value)) return null;

  const slashMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    let year = Number(slashMatch[3]);
    if (year < 100) year += 2000;

    const dt = new Date(year, month - 1, day);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  return null;
}

function shouldTreatAsSessionRow(a: string, c: string, d: string, currentDate: Date | null) {
  if (!currentDate) return false;
  if (!a) return false;
  if (!c) return false;
  if (!d) return false;
  if (tryParseDateHeader(a)) return false;
  return true;
}

function normalizeRoomToken(token: string): string {
  return token
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .trim();
}

function looksLikeRoomToken(token: string): boolean {
  const normalized = normalizeRoomToken(token);
  if (!normalized) return false;

  // catches things like 8E07, 8E7, 8W105, G29, 216, etc.
  if (/^\d+[A-Z]+\d+[A-Z0-9]*$/.test(normalized)) return true;
  if(/^[A-Z]+\d+[A-Z0-9]*$/.test(normalized)) return true;
  if (/^\d{2,4}[A-Z]*$/.test(normalized)) return true;

  return false;
}

function cleanRoom(raw: string): string {
  const normalized = normalizeRoomToken(raw);
  return normalized || normalizeSpaces(raw).toUpperCase();
}

function splitRoomSegments(raw: string): string[] {
  if (!raw) return [];

  let working = raw
    .replace(/\n/g, ",")
    .replace(/\//g, ",")
    .replace(/;/g, ",")
    .replace(/\s+\+\s+/g, ",")
    .replace(/\s{2,}/g, " ");

  const coarse = working
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const out: string[] = [];

  for (const piece of coarse) {
    const tokens = piece.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) continue;

    const buffer: string[] = [];
    for (const token of tokens) {
      if (looksLikeRoomToken(token)) {
        if (buffer.length > 0) {
          out.push(buffer.join(" "));
          buffer.length = 0;
        }
        buffer.push(token);
      } else {
        buffer.push(token);
      }
    }

    if (buffer.length > 0) {
      out.push(buffer.join(" "));
    }
  }

  const cleaned = out
    .map((segment) => cleanRoom(segment))
    .filter(Boolean);

  return dedupeStrings(cleaned);
}

function parseSingleTime(piece: string): { hour: number; minute: number } | null {
  let s = piece.toLowerCase().trim();
  if (!s) return null;

  s = s.replace(/\./g, ":").replace(/\s+/g, "");

  const hasAm = s.includes("am");
  const hasPm = s.includes("pm");

  s = s.replace("am", "").replace("pm", "");

  if (/^\d{3,4}$/.test(s)) {
    const padded = s.padStart(4, "0");
    let hour = Number(padded.slice(0, 2));
    const minute = Number(padded.slice(2, 4));

    if (hasPm && hour < 12) hour += 12;
    if (hasAm && hour === 12) hour = 0;

    return { hour, minute };
  }

  const match = s.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");

  if (hasPm && hour < 12) hour += 12;
  if (hasAm && hour === 12) hour = 0;

  return { hour, minute };
}

function toTimeString(hour: number, minute: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function parseTimeRange(raw: string): { startTime: string; endTime: string } {
  const cleaned = raw
    .replace(/[–—]/g, "-")
    .replace(/\(.*?\)/g, "")
    .trim();

  if (!cleaned) {
    return { startTime: "TBD", endTime: "TBD" };
  }

  const parts = cleaned.split("-").map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return { startTime: "TBD", endTime: "TBD" };
  }

  const start = parseSingleTime(parts[0]);
  let end = parts[1] ? parseSingleTime(parts[1]) : null;

  if (!start) {
    return { startTime: "TBD", endTime: "TBD" };
  }

  if (!end) {
    let endHour = start.hour + 1;
    let endMinute = start.minute;
    if (endHour >= 24) endHour = 23;
    end = { hour: endHour, minute: endMinute };
  }

  const startRaw = parts[0].toLowerCase();
  const endRaw = (parts[1] ?? "").toLowerCase();

  const startHasMeridiem = startRaw.includes("am") || startRaw.includes("pm");
  const endHasMeridiem = endRaw.includes("am") || endRaw.includes("pm");

  const startMinutes = start.hour * 60 + start.minute;
  let endMinutes = end.hour * 60 + end.minute;

  if (!endHasMeridiem && endMinutes <= startMinutes && end.hour < 12) {
    end.hour += 12;
    endMinutes = end.hour * 60 + end.minute;
  }

  if (!startHasMeridiem && !endHasMeridiem && endMinutes <= startMinutes && end.hour < 12) {
    end.hour += 12;
  }

  return {
    startTime: toTimeString(start.hour, start.minute),
    endTime: toTimeString(end.hour, end.minute),
  };
}

function splitTimeSegments(raw: string): string[] {
  if (!raw) return [];

  const normalized = raw
    .replace(/\n/g, ",")
    .replace(/;/g, ",")
    .replace(/\s{2,}/g, " ");

  const coarse = normalized
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const timeLike = coarse.filter((piece) => /\d/.test(piece) && (piece.includes("-") || /am|pm|:\d|\b\d{3,4}\b/i.test(piece)));

  return timeLike.length > 0 ? timeLike : coarse;
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(value.trim());
    }
  }

  return out;
}

function buildSessionCombos(roomRaw: string, timeRaw: string): Array<{ roomRaw: string; timeRaw: string }> {
  const rooms = splitRoomSegments(roomRaw);
  const times = splitTimeSegments(timeRaw);

  if (rooms.length === 0 && times.length === 0) return [];
  if (rooms.length === 0) {
    return times.map((time) => ({ roomRaw: "", timeRaw: time }));
  }
  if (times.length === 0) {
    return rooms.map((room) => ({ roomRaw: room, timeRaw: "" }));
  }

  // 1-to-1 alignment
  if (rooms.length === times.length) {
    return rooms.map((room, index) => ({
      roomRaw: room,
      timeRaw: times[index],
    }));
  }

  // one time, many rooms
  if (times.length === 1 && rooms.length > 1) {
    return rooms.map((room) => ({
      roomRaw: room,
      timeRaw: times[0],
    }));
  }

  // one room, many times
  if (rooms.length === 1 && times.length > 1) {
    return times.map((time) => ({
      roomRaw: rooms[0],
      timeRaw: time,
    }));
  }

  // fallback: pair by index, reuse last available
  const max = Math.max(rooms.length, times.length);
  const out: Array<{ roomRaw: string; timeRaw: string }> = [];

  for (let i = 0; i < max; i += 1) {
    out.push({
      roomRaw: rooms[Math.min(i, rooms.length - 1)] ?? "",
      timeRaw: times[Math.min(i, times.length - 1)] ?? "",
    });
  }

  return out;
}

export function parseScheduleRows(rows: RowLike[]): ImportedSession[] {
  const sessions: ImportedSession[] = [];
  let currentDate: Date | null = null;

  rows.forEach((row, index) => {
    const colA = asText(row[0]);
    const colB = asText(row[1]);
    const colC = asText(row[2]);
    const colD = asText(row[3]);

    if (!colA && !colB && !colC && !colD) return;

    const maybeDate = tryParseDateHeader(colA);
    if (maybeDate) {
      currentDate = maybeDate;
      return;
    }

    if (!shouldTreatAsSessionRow(colA, colC, colD, currentDate)) {
      return;
    }

    const employees = splitEmployees(colB);
    const lead = employees[0] ?? "";
    const combos = buildSessionCombos(colC, colD);

    if (combos.length === 0) {
      const parsed = parseTimeRange(colD);

      sessions.push({
        id: uid("sess"),
        date: currentDate ? formatISODate(currentDate) : "",
        eventName: normalizeSpaces(colA),
        room: cleanRoom(colC),
        roomRaw: colC,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        timeRaw: colD,
        employees,
        lead,
        sourceRow: index + 1,
      });

      return;
    }

    for (const combo of combos) {
      const parsed = parseTimeRange(combo.timeRaw || colD);

      sessions.push({
        id: uid("sess"),
        date: currentDate ? formatISODate(currentDate) : "",
        eventName: normalizeSpaces(colA),
        room: cleanRoom(combo.roomRaw || colC),
        roomRaw: combo.roomRaw || colC,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        timeRaw: combo.timeRaw || colD,
        employees,
        lead,
        sourceRow: index + 1,
      });
    }
  });

  return sessions;
}

export function groupSessionsIntoEvents(sessions: ImportedSession[]): ImportedEvent[] {
  const map = new Map<string, ImportedEvent>();

  for (const session of sessions) {
    const key = session.eventName.trim().toLowerCase();

    if (!map.has(key)) {
      map.set(key, {
        id: uid("evt"),
        name: session.eventName,
        status: "Draft",
        date_text: "",
        sp_needed: 0,
        sp_assigned: 0,
        notes: "Imported from Spring schedule uploader",
        updated_at: new Date().toISOString(),
        assignedSimOps: [],
        leadSimOps: [],
        sessions: [],
      });
    }

    const event = map.get(key)!;
    event.sessions.push(session);

    for (const employee of session.employees) {
      if (!event.assignedSimOps.some((name) => name.toLowerCase() === employee.toLowerCase())) {
        event.assignedSimOps.push(employee);
      }
    }

    if (session.lead && !event.leadSimOps.some((name) => name.toLowerCase() === session.lead.toLowerCase())) {
      event.leadSimOps.push(session.lead);
    }
  }

  const events = Array.from(map.values());

  for (const event of events) {
    const dateSet = new Set(event.sessions.map((s) => s.date));
    const prettyDates = Array.from(dateSet)
      .sort()
      .map((iso) => {
        const dt = new Date(`${iso}T00:00:00`);
        return formatShortDate(dt);
      });

    event.date_text = prettyDates.join(", ");
    event.updated_at = new Date().toISOString();

    event.sessions.sort((a, b) => {
      const ad = `${a.date} ${a.startTime} ${a.room}`;
      const bd = `${b.date} ${b.startTime} ${b.room}`;
      return ad.localeCompare(bd);
    });
  }

  events.sort((a, b) => a.name.localeCompare(b.name));

  return events;
}

export function mergeImportedEvents(importedEvents: ImportedEvent[]) {
  const existingEvents = safeRead<any[]>(EVENTS_KEY, []);
  const merged = [...existingEvents];

  for (const imported of importedEvents) {
    const existingIndex = merged.findIndex(
      (item) => String(item.name ?? "").trim().toLowerCase() === imported.name.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = merged[existingIndex];

      merged[existingIndex] = {
        ...existing,
        ...imported,
        id: existing.id ?? imported.id,
        status: existing.status ?? imported.status,
        sp_needed: existing.sp_needed ?? 0,
        sp_assigned: existing.sp_assigned ?? 0,
        notes: existing.notes
          ? `${existing.notes}\n\nImported schedule refreshed ${new Date().toLocaleString()}`
          : imported.notes,
        updated_at: new Date().toISOString(),
      };
    } else {
      merged.unshift(imported);
    }
  }

  safeWrite(EVENTS_KEY, merged);
  return merged;
}

export function ensureSimOpUsers(importedEvents: ImportedEvent[]) {
  const existingUsers = safeRead<any[]>(USERS_KEY, []);
  const users = [...existingUsers];

  const allNames = new Set<string>();

  for (const event of importedEvents) {
    for (const name of event.assignedSimOps) {
      allNames.add(name);
    }
  }

  for (const fullName of Array.from(allNames)) {
    const key = fullName.trim().toLowerCase();
    const alreadyExists = users.some((user) => {
      const full =
        `${String(user.firstName ?? "").trim()} ${String(user.lastName ?? "").trim()}`
          .trim()
          .toLowerCase();
      return full === key || String(user.username ?? "").toLowerCase() === key.replace(/\s+/g, "");
    });

    if (alreadyExists) continue;

    const parts = fullName.split(" ").filter(Boolean);
    const firstName = parts[0] ?? fullName;
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "SimOp";

    users.unshift({
      id: uid("usr"),
      firstName,
      lastName,
      email: `${usernameFromName(fullName)}@cfsp.local`,
      username: usernameFromName(fullName),
      password: "Drexel1$",
      role: "sim-op",
      createdAt: new Date().toISOString(),
    });
  }

  safeWrite(USERS_KEY, users);
  return users;
}