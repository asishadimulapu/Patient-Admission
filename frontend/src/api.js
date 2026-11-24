// npm run dev -> local backend, deployed site -> live backend on Vercel
const BACKEND_URL = import.meta.env.DEV ? "http://localhost:5000" : "https://patient-admission.vercel.app";

const BASE_URL = BACKEND_URL + "/api";

export async function api(path, method = "GET", body) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong");
    err.errors = data.errors || {};
    throw err;
  }
  return data;
}
