import { AUTH_STORAGE_KEY, AppUser, seededUsers } from "./mockData";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function findUserByLogin(login: string): AppUser | undefined {
  const normalized = normalize(login);

  return seededUsers.find((user) => {
    if (normalize(user.username) === normalized) return true;
    if (user.email && normalize(user.email) === normalized) return true;
    return (user.aliases || []).some((alias) => normalize(alias) === normalized);
  });
}

export function loginUser(login: string, password: string) {
  const found = findUserByLogin(login);

  if (!found) {
    return { ok: false as const, message: "Login not found." };
  }

  if (found.password !== password) {
    return { ok: false as const, message: "Incorrect password." };
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
  }

  return { ok: true as const, user: found };
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getCurrentUser(): AppUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}