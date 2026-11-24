import re
from datetime import date, datetime, timedelta, timezone

from options import OPTIONS

IST = timezone(timedelta(hours=5, minutes=30))


# keep these rules in sync with frontend/src/utils/validate.js
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
