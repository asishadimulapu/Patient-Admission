// data-label is used by the css to show the column name on mobile
export default function PatientTable({ patients, canEdit, onEdit, onDelete, onDischarge }) {
  return (
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
        {patients.map((patient) => (
          <tr key={patient.id}>
            <td data-label="Name">{patient.name}</td>
            <td data-label="Age">{patient.age}</td>
            <td data-label="Gender">{patient.gender}</td>
            <td data-label="Ward">{patient.ward}</td>
            <td data-label="Department">{patient.department}</td>
            <td data-label="Doctor">{patient.doctor}</td>
            <td data-label="Admitted on">{patient.admission_date}</td>
            <td data-label="Status">
              <span className={`badge ${patient.status.toLowerCase()}`}>{patient.status}</span>
            </td>
            <td>
              <div className="row-actions">
                {patient.status === "Admitted" && (
                  <button className="btn small" onClick={() => onDischarge(patient)}>
                    Discharge
                  </button>
                )}
                <button className="btn small ghost" onClick={() => onEdit(patient)} disabled={!canEdit}>
                  Edit
                </button>
                <button className="btn small danger" onClick={() => onDelete(patient)}>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
