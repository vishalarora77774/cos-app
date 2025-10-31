export type SignInPayload = { username: string; password: string };
export type SignUpPayload = {
  puid: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkSession(): Promise<boolean> {
  if (!API_BASE) {
    await delay(8000);
    return false; // default unauthenticated in mock mode
  }
  try {
    const res = await fetch(`${API_BASE}/auth/session`, {
      credentials: 'include',
    });
    await delay(8000);
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return Boolean(data?.authenticated ?? true);
  } catch {
    await delay(8000);
    return false;
  }
}

export async function signIn(payload: SignInPayload): Promise<{ success: boolean; message?: string }>
{
  if (!API_BASE) {
    await delay(600);
    return { success: payload.username.length > 0 && payload.password.length > 0 };
  }
  try {
    const res = await fetch(`${API_BASE}/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false, message: 'Invalid credentials' };
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
}

export async function signUp(payload: SignUpPayload): Promise<{ success: boolean; message?: string }>
{
  if (!API_BASE) {
    await delay(800);
    const valid =
      payload.password.length >= 6 && payload.password === payload.confirmPassword;
    return { success: valid, message: valid ? undefined : 'Password mismatch' };
  }
  try {
    const res = await fetch(`${API_BASE}/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false, message: 'Sign up failed' };
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
}


