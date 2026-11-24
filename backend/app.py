import os
import re
import sqlite3
from datetime import date, datetime, timedelta, timezone

import psycopg
from flask import Flask, jsonify, request
from flask_cors import CORS
from psycopg.rows import dict_row

from options import OPTIONS

# Vercel gives us DATABASE_URL (Neon Postgres). Locally it's not set, so we use a SQLite file.
DATABASE_URL = os.environ.get("DATABASE_URL")
DB_PATH = os.path.join(os.path.dirname(__file__), "patients.db")
IST = timezone(timedelta(hours=5, minutes=30))
FIELDS = ["name", "age", "gender", "ward", "department", "doctor", "admission_date", "status"]

app = Flask(__name__)
CORS(app)


def connect():
    if DATABASE_URL:
        return psycopg.connect(DATABASE_URL, row_factory=dict_row)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def run(sql, params=()):
    if DATABASE_URL:
        sql = sql.replace("?", "%s")  # postgres uses %s instead of ?
    conn = connect()
    try:
        cur = conn.execute(sql, params)
        rows = [dict(row) for row in cur.fetchall()] if cur.description else []
        conn.commit()
        return rows
    finally:
        conn.close()


id_column = "id SERIAL PRIMARY KEY" if DATABASE_URL else "id INTEGER PRIMARY KEY AUTOINCREMENT"
run(f"""CREATE TABLE IF NOT EXISTS patients (
    {id_column},
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    ward TEXT NOT NULL,
    department TEXT NOT NULL,
    doctor TEXT NOT NULL,
    admission_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Admitted'
)""")


# keep these rules in sync with frontend/src/validate.js
def validate(data):
    if not isinstance(data, dict):
        return None, {"body": "Request body must be a JSON object"}

    errors = {}
    patient = {}

    name = str(data.get("name") or "").strip()
    if not name:
        errors["name"] = "Name is required"
    elif not re.fullmatch(r"[A-Za-z ]+", name):
        errors["name"] = "Name must contain letters only"
    patient["name"] = " ".join(name.split())

    age = data.get("age")
    if age is None or str(age).strip() == "":
        errors["age"] = "Age is required"
    else:
        try:
            num = float(age)
        except (TypeError, ValueError):
            num = -1
        if isinstance(age, bool) or not num.is_integer() or not 0 <= num <= 120:
            errors["age"] = "Age must be a whole number between 0 and 120"
        else:
            patient["age"] = int(num)

    for field in ["gender", "ward", "department", "doctor"]:
        value = data.get(field)
        if not value:
            errors[field] = f"{field.capitalize()} is required"
        elif value not in OPTIONS[field]:
            errors[field] = f"{field.capitalize()} must be one of: {', '.join(OPTIONS[field])}"
        patient[field] = value

    adm = str(data.get("admission_date") or "").strip()
    if not adm:
        errors["admission_date"] = "Admission date is required"
    elif not re.fullmatch(r"\d{4}-\d{2}-\d{2}", adm):
        errors["admission_date"] = "Admission date must be in YYYY-MM-DD format"
    else:
        try:
            if date.fromisoformat(adm) > datetime.now(IST).date():
                errors["admission_date"] = "Admission date cannot be in the future"
        except ValueError:
            errors["admission_date"] = "Admission date is not a valid date"
    patient["admission_date"] = adm

    status = data.get("status") or "Admitted"
    if status not in OPTIONS["status"]:
        errors["status"] = "Status must be Admitted or Discharged"
    patient["status"] = status

    return patient, errors


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
