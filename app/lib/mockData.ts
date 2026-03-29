export type EventStatus = "Needs SPs" | "Scheduled" | "In Progress" | "Complete";
export type VisibilityType = "Team" | "Personal";
export type PoolType = "CICSP" | "Elkins Park" | "Both";
export type UserRole = "sp" | "sim_op";

export type StaffRelationship = "Lead" | "Assigned" | "Associated";

export type EventItem = {
  id: string;
  name: string;
  status: EventStatus;
  dateText: string;
  spNeeded: number;
  spAssigned: number;
  visibility: VisibilityType;
  location: string;
  notes: string;
  leadSimOp?: string;
  assignedStaff?: string[];
  associatedStaff?: string[];
  assignedSPIds?: string[];
};

export type SPItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  portrayalAge: string;
  raceSex: string;
  status: "Active" | "Inactive";
  notes: string;
  pool: PoolType;
  username: string;
  defaultPassword: string;
  profileImageUrl?: string;
};

export type SimOpItem = {
  id: string;
  fullName: string;
  aliases: string[];
  username: string;
  defaultPassword: string;
  role: "sim_op";
};

export const DEFAULT_PASSWORD = "Drexel1$";

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildUsername(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (!parts.length) return "";
  const first = parts[0] || "";
  const last = parts[parts.length - 1] || "";
  return `${first.charAt(0)}${last}`.toLowerCase().replace(/[^a-z]/g, "");
}

export function normalizePersonName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export const simOps: SimOpItem[] = [
  {
    id: "quentin",
    fullName: "Quentin",
    aliases: ["quentin", "q"],
    username: "q",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "cory",
    fullName: "Cory",
    aliases: ["cory", "cbrodsky", "brodsky"],
    username: "cbrodsky",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "kate",
    fullName: "Kate",
    aliases: ["kate"],
    username: "kate",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "kat",
    fullName: "Kat",
    aliases: ["kat"],
    username: "kat",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "jamiel",
    fullName: "Jamiel",
    aliases: ["jamiel"],
    username: "jamiel",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "jp",
    fullName: "JP",
    aliases: ["jp"],
    username: "jp",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "patrick",
    fullName: "Patrick",
    aliases: ["patrick", "pat"],
    username: "ppatrick",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "cristina",
    fullName: "Cristina",
    aliases: ["cristina"],
    username: "ccristina",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "kevin",
    fullName: "Kevin",
    aliases: ["kevin"],
    username: "kkevin",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "kris",
    fullName: "Kris",
    aliases: ["kris"],
    username: "kkris",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "helen",
    fullName: "Helen",
    aliases: ["helen"],
    username: "hhelen",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
  {
    id: "diane",
    fullName: "Diane",
    aliases: ["diane"],
    username: "ddiane",
    defaultPassword: DEFAULT_PASSWORD,
    role: "sim_op",
  },
];

export function resolveSimOpName(value: string) {
  const normalized = normalizePersonName(value);
  const found = simOps.find((person) =>
    person.aliases.some((alias) => normalizePersonName(alias) === normalized)
  );
  return found?.fullName || value;
}

export function isSimOpName(value: string) {
  const normalized = normalizePersonName(value);
  return simOps.some((person) =>
    person.aliases.some((alias) => normalizePersonName(alias) === normalized)
  );
}

export const events: EventItem[] = [
  {
    id: "n651-virtual",
    name: "N651 Virtual",
    status: "Needs SPs",
    dateText: "3/10, 3/11",
    spNeeded: 6,
    spAssigned: 2,
    visibility: "Team",
    location: "Zoom",
    notes: "Virtual nursing event. Need additional SP coverage.",
    leadSimOp: "Cory",
    assignedStaff: ["Kate"],
    associatedStaff: ["Quentin"],
    assignedSPIds: ["allen-adair", "amy-fitzpatrick"],
  },
  {
    id: "nupr706-vir",
    name: "NUPR706 VIR",
    status: "Scheduled",
    dateText: "3/15",
    spNeeded: 4,
    spAssigned: 4,
    visibility: "Team",
    location: "Elkins Park",
    notes: "Faculty confirmed. Training complete.",
    leadSimOp: "Quentin",
    assignedStaff: ["Cory"],
    associatedStaff: ["Kate"],
    assignedSPIds: ["amy-fitzpatrick"],
  },
  {
    id: "pa-osce-a",
    name: "PA OSCE A",
    status: "In Progress",
    dateText: "3/21",
    spNeeded: 3,
    spAssigned: 3,
    visibility: "Team",
    location: "8E07",
    notes: "Running today. Monitor attendance and breaks.",
    leadSimOp: "Q",
    assignedStaff: ["Patrick"],
    associatedStaff: ["Cory"],
    assignedSPIds: [],
  },
  {
    id: "dysphagia-ipe",
    name: "IPE Dysphagia",
    status: "Complete",
    dateText: "2/28",
    spNeeded: 3,
    spAssigned: 3,
    visibility: "Team",
    location: "Simulation Center",
    notes: "Completed successfully.",
    leadSimOp: "Cory",
    assignedStaff: ["Jamiel"],
    associatedStaff: ["Q"],
    assignedSPIds: ["allen-adair"],
  },
];

export const sps: SPItem[] = [
  {
    id: "allen-adair",
    fullName: "Allen Adair",
    email: "apadair01@gmail.com",
    phone: "970-712-9623",
    portrayalAge: "20's",
    raceSex: "W / M",
    status: "Active",
    notes: "Strong communication. Good fit for student-facing encounters.",
    pool: "CICSP",
    username: "aadair",
    defaultPassword: DEFAULT_PASSWORD,
  },
  {
    id: "amy-fitzpatrick",
    fullName: "Amy Fitzpatrick",
    email: "amf346@drexel.edu",
    phone: "267-275-6971",
    portrayalAge: "68",
    raceSex: "W / F",
    status: "Active",
    notes: "Reliable. Great for older adult portrayals.",
    pool: "Elkins Park",
    username: "afitzpatrick",
    defaultPassword: DEFAULT_PASSWORD,
  },
];

export type AssignmentDraft = {
  id: string;
  spId: string;
  spName: string;
  eventMode: "existing" | "placeholder";
  eventId?: string;
  eventName: string;
  dateText?: string;
  notes?: string;
  createdAt: string;
};

export const ASSIGNMENT_STORAGE_KEY = "cfsp_assignment_drafts";