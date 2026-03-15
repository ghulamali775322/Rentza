const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ---------------- SIGNUP ---------------- */

export async function signup(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Signup failed");
  }

  return result;
}

/* ---------------- LOGIN ---------------- */

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}

/* ---------------- VERIFY EMAIL ---------------- */

export async function verifyEmail(token: string) {
  const res = await fetch(`${API_URL}/auth/verify-email?token=${token}`);

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Verification failed");
  }

  return result;
}

/* ---------------- FORGOT PASSWORD ---------------- */

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

/* ---------------- RESET PASSWORD ---------------- */

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Reset failed");
  }

  return result;
}
