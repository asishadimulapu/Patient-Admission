const COLUMNS = [
  ["name", "Name"],
  ["age", "Age"],
  ["gender", "Gender"],
  ["ward", "Ward"],
  ["department", "Department"],
  ["doctor", "Doctor"],
  ["admission_date", "Admitted on"],
];

export default function PatientTable({ patients, canEdit, onEdit, onDelete, onDischarge }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {COLUMNS.map(([key, label]) => (
            <th key={key}>{label}</th>
          ))}
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {patients.map((p) => (
          <tr key={p.id}>
            {COLUMNS.map(([key, label]) => (
              <td key={key} data-label={label}>
                {p[key]}
              </td>
            ))}
            <td data-label="Status">
              <span className={`badge ${p.status.toLowerCase()}`}>{p.status}</span>
            </td>
            <td>
              <div className="row-actions">
                {p.status === "Admitted" && (
                  <button className="btn small" onClick={() => onDischarge(p)}>
                    Discharge
                  </button>
                )}
                <button className="btn small ghost" onClick={() => onEdit(p)} disabled={!canEdit}>
                  Edit
                </button>
                <button className="btn small danger" onClick={() => onDelete(p)}>
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
