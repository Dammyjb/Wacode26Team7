export const DEMO_EMAIL = "demo@foodwise.com";
export const DEMO_PASSWORD = "foodwise2024";
const SESSION_KEY = "fw_session";

export function login(email: string, password: string): boolean {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
