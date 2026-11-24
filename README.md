# Patient Admission Management App

Web app for hospital staff to manage admitted patients - add, view, search, filter, edit, discharge and delete.

Live link: _add frontend URL here_
API: _add backend URL here_

## Tech stack

- Frontend: React (Vite), plain CSS
- Backend: Python, Flask
- Database: PostgreSQL (Neon) on the live site, SQLite file when running locally. Both keep data after a server restart.

## Features

- Add / edit / delete patients (delete asks for confirmation)
- List of all patients with total, admitted and discharged counts
- Search by name
- Filter by ward, department and doctor
- Mark a patient as discharged
- Works on mobile, tablet and desktop (on mobile the table turns into cards)

## Validation

Same rules are checked in the frontend and the backend:

- Name - required, letters only (spaces allowed between words)
- Age - required, whole number from 0 to 120
- Gender, Ward, Department, Doctor - required, must be one of the given options
- Admission date - required, can't be a future date

If the backend gets bad data it returns `400` with a message, for example:

```json
{ "message": "Age must be a whole number between 0 and 120", "errors": { "age": "..." } }
```

## Folder structure

```
backend/
  app.py            routes, validation, database
  options.py        dropdown values (wards, doctors etc.)
  requirements.txt
frontend/
  src/App.jsx           patient list, search, filters
  src/PatientForm.jsx   add / edit form
  src/validate.js       frontend validation
  src/api.js            fetch helper
  src/styles.css
```

To add a new ward, doctor or department, just edit `backend/options.py`. The frontend loads the lists from `/api/options`, so nothing else needs to change.

## API

| Method | Endpoint                         | Description        |
|--------|----------------------------------|--------------------|
| GET    | /api/options                     | dropdown values    |
| GET    | /api/patients                    | list patients      |
| POST   | /api/patients                    | add patient        |
| PUT    | /api/patients/:id                | update patient     |
| PATCH  | /api/patients/:id/discharge      | discharge patient  |
| DELETE | /api/patients/:id                | delete patient     |

## Running locally

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # on Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5000

Frontend (in another terminal):

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173. By default it calls the backend at `http://localhost:5000`. To change that, create `frontend/.env.local` with:

```
VITE_API_URL=https://your-backend-url
```

## Deployment

Both parts are deployed on Vercel as two separate projects from this repo.

Backend:

1. Add New -> Project -> import this repo, set root directory to `backend` (Vercel detects Flask)
2. Deploy, then go to Storage -> Create Database -> Neon (Postgres) and connect it to this project. This adds `DATABASE_URL`.
3. Redeploy so the backend picks up `DATABASE_URL`

Frontend:

1. Add New -> Project -> import the same repo, set root directory to `frontend`
2. Add env variable `VITE_API_URL` = backend URL (no `/` at the end)
3. Deploy

## Screenshots

_add screenshots here_
