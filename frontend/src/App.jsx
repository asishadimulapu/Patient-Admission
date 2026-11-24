import { useEffect, useState } from "react";
import { api } from "./api";
import PatientForm from "./PatientForm";

const FILTERS = [
  ["ward", "Ward"],
  ["department", "Department"],
  ["doctor", "Doctor"],
];
const NO_FILTERS = { ward: "", department: "", doctor: "" };

export default function App() {
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [editing, setEditing] = useState(null); // {} for a new patient, or the patient being edited
  const [error, setError] = useState("");

  function loadPatients() {
    api("/patients")
      .then(setPatients)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    api("/options")
      .then(setOptions)
      .catch(() => setError("Could not connect to the server. Is the backend running?"));
    loadPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const nameMatches = p.name.toLowerCase().includes(search.trim().toLowerCase());
    const filtersMatch = FILTERS.every(([key]) => !filters[key] || p[key] === filters[key]);
    return nameMatches && filtersMatch;
  });

  async function savePatient(p) {
    if (p.id) {
      await api(`/patients/${p.id}`, "PUT", p);
    } else {
      await api("/patients", "POST", p);
    }
    setEditing(null);
    loadPatients();
  }

  async function deletePatient(p) {
    if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try {
      await api(`/patients/${p.id}`, "DELETE");
    } catch (e) {
      setError(e.message);
    }
    loadPatients();
  }

  async function dischargePatient(p) {
    try {
      await api(`/patients/${p.id}/discharge`, "PATCH");
    } catch (e) {
      setError(e.message);
    }
    loadPatients();
  }

  function clearFilters() {
    setFilters(NO_FILTERS);
    setSearch("");
  }

  const admittedCount = patients.filter((p) => p.status === "Admitted").length;

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Patient Admissions</h1>
          <p className="muted">
            {patients.length} total · {admittedCount} admitted · {patients.length - admittedCount} discharged
          </p>
        </div>
        <button className="btn primary" onClick={() => setEditing({})} disabled={!options}>
          + Add patient
        </button>
      </header>

      {error && (
        <p className="alert" onClick={() => setError("")}>
          {error}
        </p>
      )}

      <section className="toolbar">
        <input
          type="search"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {options &&
          FILTERS.map(([key, label]) => (
            <select
              key={key}
              value={filters[key]}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            >
              <option value="">All {label.toLowerCase()}s</option>
              {options[key].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ))}
        <button className="btn ghost" onClick={clearFilters}>
          Clear
        </button>
      </section>

      {filtered.length === 0 ? (
        <p className="empty">
          {patients.length > 0 ? "No patients match your search." : "No patients yet. Add the first one."}
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Ward</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Admitted on</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td data-label="Name" className="name">{p.name}</td>
                <td data-label="Age">{p.age}</td>
                <td data-label="Gender">{p.gender}</td>
                <td data-label="Ward">{p.ward}</td>
                <td data-label="Department">{p.department}</td>
                <td data-label="Doctor">{p.doctor}</td>
                <td data-label="Admitted on">{p.admission_date}</td>
                <td data-label="Status">
                  <span className={`badge ${p.status.toLowerCase()}`}>{p.status}</span>
                </td>
                <td className="row-actions">
                  {p.status === "Admitted" && (
                    <button className="btn small" onClick={() => dischargePatient(p)}>
                      Discharge
                    </button>
                  )}
                  <button className="btn small ghost" onClick={() => setEditing(p)} disabled={!options}>
                    Edit
                  </button>
                  <button className="btn small danger" onClick={() => deletePatient(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && options && (
        <PatientForm
          patient={editing}
          options={options}
          onSave={savePatient}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
