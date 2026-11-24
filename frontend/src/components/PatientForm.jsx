import { useState } from "react";
import { today, validate } from "../utils/validate";

const SELECTS = [
  ["gender", "Gender"],
  ["ward", "Ward"],
  ["department", "Department"],
  ["doctor", "Doctor"],
  ["status", "Status"],
];

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="error">{error}</small>}
    </label>
  );
}

export default function PatientForm({ patient, options, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    ward: "",
    department: "",
    doctor: "",
    admission_date: today(),
    status: "Admitted",
    ...patient,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, options);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setErrors({ ...err.errors, form: err.message });
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit} noValidate>
        <h2>{patient.id ? "Edit patient" : "Add patient"}</h2>
        {errors.form && <p className="alert">{errors.form}</p>}

        <div className="grid">
          <Field label="Name" error={errors.name}>
            <input value={form.name} onChange={handleChange("name")} placeholder="e.g. Ravi Kumar" autoFocus />
          </Field>
          <Field label="Age" error={errors.age}>
            <input type="number" min="0" max="120" value={form.age} onChange={handleChange("age")} />
          </Field>

          {SELECTS.map(([key, label]) => (
            <Field key={key} label={label} error={errors[key]}>
              <select value={form[key]} onChange={handleChange(key)}>
                <option value="">Select {label.toLowerCase()}</option>
                {options[key].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          ))}

          <Field label="Admission date" error={errors.admission_date}>
            <input
              type="date"
              max={today()}
              value={form.admission_date}
              onChange={handleChange("admission_date")}
            />
          </Field>
        </div>

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
