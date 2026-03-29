export type UserRole = "admin" | "sim-op" | "sp";

export type DemoUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
};

const USERS_KEY = "cfsp_demo_users_v1";
const SESSION_KEY = "cfsp_demo_session_v1";

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

function uid() {
  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getUsers(): DemoUser[] {
  const users = safeRead<DemoUser[]>(USERS_KEY, []);

  if (users.length === 0) {
    const seedUsers: DemoUser[] = [
      {
        id: uid(),
        firstName: "Cory",
        lastName: "Brodsky",
        email: "admin@cfsp.local",
        username: "cbrodsky",
        password: "Drexel1$",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        firstName: "Sim",
        lastName: "Ops",
        email: "simop@cfsp.local",
        username: "simops",
        password: "Drexel1$",
        role: "sim-op",
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        firstName: "Sample",
        lastName: "SP",
        email: "sp@cfsp.local",
        username: "ssp",
        password: "Drexel1$",
        role: "sp",
        createdAt: new Date().toISOString(),
      },
    ];

    safeWrite(USERS_KEY, seedUsers);
    return seedUsers;
  }

  return users;
}

export function saveUsers(users: DemoUser[]) {
  safeWrite(USERS_KEY, users);
}

export function getSession(): DemoUser | null {
  return safeRead<DemoUser | null>(SESSION_KEY, null);
}

export function setSession(user: DemoUser) {
  safeWrite(SESSION_KEY, user);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function buildUsername(firstName: string, lastName: string) {
  const first = (firstName || "").trim().toLowerCase();
  const last = (lastName || "").trim().toLowerCase().replace(/\s+/g, "");
  return `${first.slice(0, 1)}${last}`;
}

export function findUserByLogin(login: string) {
  const users = getUsers();
  const normalized = login.trim().toLowerCase();

  return (
    users.find((u) => u.email.toLowerCase() === normalized) ||
    users.find((u) => u.username.toLowerCase() === normalized) ||
    null
  );
}

export function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const users = getUsers();

  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const usernameBase = buildUsername(firstName, lastName);

  if (!firstName || !lastName || !email || !input.password.trim()) {
    return { ok: false as const, error: "All fields are required." };
  }

  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false as const, error: "That email is already in use." };
  }

  let username = usernameBase;
  let counter = 2;

  while (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    username = `${usernameBase}${counter}`;
    counter += 1;
  }

  const newUser: DemoUser = {
    id: uid(),
    firstName,
    lastName,
    email,
    username,
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [newUser, ...users];
  saveUsers(nextUsers);
  setSession(newUser);

  return { ok: true as const, user: newUser };
}

export function loginUser(login: string, password: string) {
  const user = findUserByLogin(login);

  if (!user) {
    return { ok: false as const, error: "No account found for that email or username." };
  }

  if (user.password !== password) {
    return { ok: false as const, error: "Incorrect password." };
  }

  setSession(user);
  return { ok: true as const, user };
}