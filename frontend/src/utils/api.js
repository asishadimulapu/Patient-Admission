// local backend during npm run dev, live backend after build
const BACKEND_URL = import.meta.env.DEV ? "http://localhost:5000" : "https://patient-admission.vercel.app";
const API_URL = BACKEND_URL + "/api";

export async function api(path, method = "GET", body = null) {
  const requestOptions = { method, headers: {} };
  if (body) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_URL + path, requestOptions);
  } catch {
    throw new Error("Could not connect to the server. Please try again.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.errors = data.errors || {};
    throw error;
  }
  return data;
}
