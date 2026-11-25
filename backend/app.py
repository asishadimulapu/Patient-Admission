import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from db import create_table, run_query
from options import OPTIONS
from validation import validate_patient

app = Flask(__name__)
CORS(app)
create_table()


def validation_error(errors):
    message = "; ".join(errors.values())
    return jsonify({"message": message, "errors": errors}), 400


@app.get("/")
def home():
    return jsonify({"message": "Patient Admission API is running"})


@app.get("/api/options")
def get_options():
    return jsonify(OPTIONS)


@app.get("/api/patients")
def get_patients():
    patients = run_query("SELECT * FROM patients ORDER BY id DESC")
    return jsonify(patients)


@app.post("/api/patients")
def add_patient():
    patient, errors = validate_patient(request.get_json(silent=True))
    if errors:
        return validation_error(errors)

    rows = run_query(
        """
        INSERT INTO patients (name, age, gender, ward, department, doctor, admission_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
        """,
        (
            patient["name"],
            patient["age"],
            patient["gender"],
            patient["ward"],
            patient["department"],
            patient["doctor"],
            patient["admission_date"],
            patient["status"],
        ),
    )
    return jsonify(rows[0]), 201


@app.put("/api/patients/<int:patient_id>")
def update_patient(patient_id):
    patient, errors = validate_patient(request.get_json(silent=True))
    if errors:
        return validation_error(errors)

    rows = run_query(
        """
        UPDATE patients
        SET name = ?, age = ?, gender = ?, ward = ?, department = ?,
            doctor = ?, admission_date = ?, status = ?
        WHERE id = ?
        RETURNING *
        """,
        (
            patient["name"],
            patient["age"],
            patient["gender"],
            patient["ward"],
            patient["department"],
            patient["doctor"],
            patient["admission_date"],
            patient["status"],
            patient_id,
        ),
    )
    if not rows:
        return jsonify({"message": "Patient not found"}), 404
    return jsonify(rows[0])


@app.patch("/api/patients/<int:patient_id>/discharge")
def discharge_patient(patient_id):
    rows = run_query(
        "UPDATE patients SET status = 'Discharged' WHERE id = ? RETURNING *",
        (patient_id,),
    )
    if not rows:
        return jsonify({"message": "Patient not found"}), 404
    return jsonify(rows[0])


@app.delete("/api/patients/<int:patient_id>")
def delete_patient(patient_id):
    rows = run_query("DELETE FROM patients WHERE id = ? RETURNING id", (patient_id,))
    if not rows:
        return jsonify({"message": "Patient not found"}), 404
    return jsonify({"message": "Patient deleted"})


if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)))
