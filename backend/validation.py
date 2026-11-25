import re
from datetime import date, datetime, timedelta, timezone

from options import OPTIONS

INDIA_TIMEZONE = timezone(timedelta(hours=5, minutes=30))
AGE_ERROR = "Age must be a whole number between 0 and 120"


# same rules are in frontend/src/utils/validate.js
def validate_patient(data):
    if not isinstance(data, dict):
        return None, {"body": "Request body must be a JSON object"}

    errors = {}
    patient = {}

    name = str(data.get("name") or "").strip()
    if name == "":
        errors["name"] = "Name is required"
    elif not re.fullmatch(r"[A-Za-z ]+", name):
        errors["name"] = "Name must contain letters only"
    else:
        patient["name"] = " ".join(name.split())

    # 45, "45" and 45.0 are all fine
    age = data.get("age")
    if age is None or str(age).strip() == "":
        errors["age"] = "Age is required"
    elif isinstance(age, bool):
        errors["age"] = AGE_ERROR
    else:
        try:
            age_number = float(age)
        except (TypeError, ValueError):
            errors["age"] = AGE_ERROR
        else:
            if not age_number.is_integer() or age_number < 0 or age_number > 120:
                errors["age"] = AGE_ERROR
            else:
                patient["age"] = int(age_number)

    for field in ["gender", "ward", "department", "doctor"]:
        label = field.capitalize()
        value = data.get(field)
        if not value:
            errors[field] = f"{label} is required"
        elif value not in OPTIONS[field]:
            errors[field] = f"{label} must be one of: {', '.join(OPTIONS[field])}"
        else:
            patient[field] = value

    admission_date = str(data.get("admission_date") or "").strip()
    if admission_date == "":
        errors["admission_date"] = "Admission date is required"
    elif not re.fullmatch(r"\d{4}-\d{2}-\d{2}", admission_date):
        errors["admission_date"] = "Admission date must be in YYYY-MM-DD format"
    else:
        try:
            parsed_date = date.fromisoformat(admission_date)
        except ValueError:
            errors["admission_date"] = "Admission date is not a valid date"
        else:
            # server runs in UTC, so check against today's date in India
            today_in_india = datetime.now(INDIA_TIMEZONE).date()
            if parsed_date > today_in_india:
                errors["admission_date"] = "Admission date cannot be in the future"
            else:
                patient["admission_date"] = admission_date

    status = data.get("status") or "Admitted"
    if status not in OPTIONS["status"]:
        errors["status"] = "Status must be Admitted or Discharged"
    else:
        patient["status"] = status

    return patient, errors
