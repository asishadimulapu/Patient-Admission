// same rules as validate() in backend/validation.py

// today's date in India time, as YYYY-MM-DD
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export function validate(p, options) {
  const errors = {};

  const name = (p.name || "").trim();
  if (!name) errors.name = "Name is required";
  else if (!/^[A-Za-z ]+$/.test(name)) errors.name = "Name must contain letters only";

  const age = String(p.age ?? "").trim();
  if (age === "") errors.age = "Age is required";
  else if (!/^\d+$/.test(age) || Number(age) > 120) errors.age = "Age must be a whole number between 0 and 120";

  for (const field of ["gender", "ward", "department", "doctor", "status"]) {
    const label = field[0].toUpperCase() + field.slice(1);
    if (!p[field]) errors[field] = `${label} is required`;
    else if (!options[field].includes(p[field])) errors[field] = `Please choose a ${field} from the list`;
  }

  if (!p.admission_date) errors.admission_date = "Admission date is required";
  else if (p.admission_date > today()) errors.admission_date = "Admission date cannot be in the future";

  return errors;
}
