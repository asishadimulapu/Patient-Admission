import { useEffect, useState } from "react";
import Filters from "./components/Filters";
import PatientForm from "./components/PatientForm";
import PatientTable from "./components/PatientTable";
import { api } from "./utils/api";

const EMPTY_FILTERS = { ward: "", department: "", doctor: "" };

export default function App() {
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // null when adding a new patient
  const [error, setError] = useState("");

  async function loadPatients() {
    try {
      const data = await api("/patients");
      setPatients(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadOptions() {
    try {
      const data = await api("/options");
      setOptions(data);
    } catch {
      setError("Could not connect to the server. Is the backend running?");
    }
  }

  useEffect(() => {
    loadOptions();
    loadPatients();
  }, []);

  const searchText = search.trim().toLowerCase();
  const filteredPatients = patients.filter((patient) => {
    const matchesName = patient.name.toLowerCase().includes(searchText);
    const matchesWard = filters.ward === "" || patient.ward === filters.ward;
    const matchesDepartment = filters.department === "" || patient.department === filters.department;
    const matchesDoctor = filters.doctor === "" || patient.doctor === filters.doctor;
    return matchesName && matchesWard && matchesDepartment && matchesDoctor;
  });

  const admittedCount = patients.filter((patient) => patient.status === "Admitted").length;
  const dischargedCount = patients.length - admittedCount;

  function changeFilter(field, value) {
    setFilters({ ...filters, [field]: value });
  }

  function clearFilters() {
    setSearch("");
    setFilters(EMPTY_FILTERS);
  }

  function openAddForm() {
    setSelectedPatient(null);
    setIsFormOpen(true);
  }

  function openEditForm(patient) {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setSelectedPatient(null);
  }

  // no try/catch here, PatientForm catches the error and shows it
  async function savePatient(formData) {
    if (selectedPatient) {
      await api(`/patients/${selectedPatient.id}`, "PUT", formData);
    } else {
      await api("/patients", "POST", formData);
    }
    closeForm();
    loadPatients();
  }

  async function deletePatient(patient) {
    const confirmed = window.confirm(`Delete ${patient.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    try {
      await api(`/patients/${patient.id}`, "DELETE");
    } catch (err) {
      setError(err.message);
    }
    loadPatients();
  }

  async function dischargePatient(patient) {
    try {
      await api(`/patients/${patient.id}/discharge`, "PATCH");
    } catch (err) {
      setError(err.message);
    }
    loadPatients();
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Patient Admissions</h1>
          <p className="muted">
            {patients.length} total · {admittedCount} admitted · {dischargedCount} discharged
          </p>
        </div>
        <button className="btn primary" onClick={openAddForm} disabled={!options}>
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
        filters={filters}
        onSearchChange={setSearch}
        onFilterChange={changeFilter}
        onClear={clearFilters}
      />

      {filteredPatients.length === 0 ? (
        <p className="empty">
          {patients.length > 0 ? "No patients match your search." : "No patients yet. Add the first one."}
        </p>
      ) : (
        <PatientTable
          patients={filteredPatients}
          canEdit={options !== null}
          onEdit={openEditForm}
          onDelete={deletePatient}
          onDischarge={dischargePatient}
        />
      )}

      {isFormOpen && options && (
        <PatientForm patient={selectedPatient} options={options} onSave={savePatient} onClose={closeForm} />
      )}
    </div>
  );
}
