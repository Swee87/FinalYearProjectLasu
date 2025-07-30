// src/services/staffAuth.js
export async function loginStaff({ email, password }) {
  const response = await fetch('http://localhost:5000/auth1/staff-login', {
    method: 'POST',
    credentials: 'include', // to receive cookies
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (!response.ok) {
    const message =
      result?.message ||
      (Array.isArray(result?.errors) ? result.errors[0]?.msg : "Login failed");
    throw new Error(message);
  }

  return result;
}
