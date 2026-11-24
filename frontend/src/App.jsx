import { useEffect, useState } from "react";
import Filters, { FILTERS, NO_FILTERS } from "./components/Filters";
import PatientForm from "./components/PatientForm";
import PatientTable from "./components/PatientTable";
import { api } from "./utils/api";

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
    await api(`/patients/${p.id}`, "DELETE").catch((e) => setError(e.message));
    loadPatients();
  }

  async function dischargePatient(p) {
    await api(`/patients/${p.id}/discharge`, "PATCH").catch((e) => setError(e.message));
    loadPatients();
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

      <Filters
        options={options}
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
      />

      {filtered.length === 0 ? (
        <p className="empty">
          {patients.length > 0 ? "No patients match your search." : "No patients yet. Add the first one."}
        </p>
      ) : (
        <PatientTable
          patients={filtered}
          canEdit={!!options}
          onEdit={setEditing}
          onDelete={deletePatient}
          onDischarge={dischargePatient}
        />
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
