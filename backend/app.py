import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from db import create_table, run
from options import OPTIONS
from validation import validate

FIELDS = ["name", "age", "gender", "ward", "department", "doctor", "admission_date", "status"]

app = Flask(__name__)
CORS(app)
create_table()


def bad_request(errors):
    return jsonify({"message": "; ".join(errors.values()), "errors": errors}), 400


def found(rows):
    if not rows:
        return jsonify({"message": "Patient not found"}), 404
    return jsonify(rows[0])


@app.get("/")
def home():
    return jsonify({"message": "Patient Admission API is running"})


@app.get("/api/options")
def options():
    return jsonify(OPTIONS)


@app.get("/api/patients")
def list_patients():
    return jsonify(run("SELECT * FROM patients ORDER BY id DESC"))


@app.post("/api/patients")
def add_patient():
    patient, errors = validate(request.get_json(silent=True))
    if errors:
        return bad_request(errors)
    placeholders = ", ".join("?" for _ in FIELDS)
    rows = run(
        f"INSERT INTO patients ({', '.join(FIELDS)}) VALUES ({placeholders}) RETURNING *",
        [patient[f] for f in FIELDS],
    )
    return jsonify(rows[0]), 201


@app.put("/api/patients/<int:pid>")
def edit_patient(pid):
    patient, errors = validate(request.get_json(silent=True))
    if errors:
        return bad_request(errors)
    columns = ", ".join(f"{f} = ?" for f in FIELDS)
    return found(run(f"UPDATE patients SET {columns} WHERE id = ? RETURNING *", [patient[f] for f in FIELDS] + [pid]))


@app.patch("/api/patients/<int:pid>/discharge")
def discharge_patient(pid):
    return found(run("UPDATE patients SET status = 'Discharged' WHERE id = ? RETURNING *", (pid,)))


@app.delete("/api/patients/<int:pid>")
def delete_patient(pid):
    return found(run("DELETE FROM patients WHERE id = ? RETURNING *", (pid,)))


if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)))
