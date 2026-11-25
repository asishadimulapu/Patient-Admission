// keep these rules the same as backend/validation.py

const AGE_ERROR = "Age must be a whole number between 0 and 120";

// en-CA gives the date as YYYY-MM-DD
export function getTodayInIndia() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function validatePatient(patient, options) {
  const errors = {};

  const name = patient.name.trim();
  if (name === "") {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z ]+$/.test(name)) {
    errors.name = "Name must contain letters only";
  }

  const age = String(patient.age).trim();
  if (age === "") {
    errors.age = "Age is required";
  } else {
    const ageNumber = Number(age);
    if (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 120) {
      errors.age = AGE_ERROR;
    }
  }

  for (const field of ["gender", "ward", "department", "doctor"]) {
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    const value = patient[field];
    if (!value) {
      errors[field] = `${label} is required`;
    } else if (!options[field].includes(value)) {
      errors[field] = `${label} must be one of: ${options[field].join(", ")}`;
    }
  }

  const admissionDate = patient.admission_date;
  if (!admissionDate) {
    errors.admission_date = "Admission date is required";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(admissionDate)) {
    errors.admission_date = "Admission date must be in YYYY-MM-DD format";
  } else if (admissionDate > getTodayInIndia()) {
    errors.admission_date = "Admission date cannot be in the future";
  }

  if (!options.status.includes(patient.status)) {
    errors.status = "Status must be Admitted or Discharged";
  }

  return errors;
}
