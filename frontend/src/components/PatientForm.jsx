import { useState } from "react";
import { getTodayInIndia, validatePatient } from "../utils/validate";

const SELECT_FIELDS = [
  ["gender", "Gender"],
  ["ward", "Ward"],
  ["department", "Department"],
  ["doctor", "Doctor"],
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
  const emptyForm = {
    name: "",
    age: "",
    gender: "",
    ward: "",
    department: "",
    doctor: "",
    admission_date: getTodayInIndia(),
    status: "Admitted",
  };
  const [form, setForm] = useState(patient ? { ...patient } : emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formErrors = validatePatient(form, options);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } catch (error) {
      setErrors({ ...error.errors, form: error.message });
      setSaving(false);
    }
  }

  // only close when the dark background is clicked, not the form itself
  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="overlay" onMouseDown={handleOverlayMouseDown}>
      <form className="modal" onSubmit={handleSubmit} noValidate>
        <h2>{patient ? "Edit patient" : "Add patient"}</h2>
        {errors.form && <p className="alert">{errors.form}</p>}

        <div className="grid">
          <Field label="Name" error={errors.name}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ravi Kumar" autoFocus />
          </Field>

          <Field label="Age" error={errors.age}>
            <input name="age" type="number" min="0" max="120" value={form.age} onChange={handleChange} />
          </Field>

          {SELECT_FIELDS.map(([field, label]) => (
            <Field key={field} label={label} error={errors[field]}>
              <select name={field} value={form[field]} onChange={handleChange}>
                <option value="">Select {label.toLowerCase()}</option>
                {options[field].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
          ))}

          <Field label="Status" error={errors.status}>
            <select name="status" value={form.status} onChange={handleChange}>
              {options.status.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>

          <Field label="Admission date" error={errors.admission_date}>
            <input
              name="admission_date"
              type="date"
              max={getTodayInIndia()}
              value={form.admission_date}
              onChange={handleChange}
            />
          </Field>
        </div>

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
