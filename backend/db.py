import os
import sqlite3

import psycopg
from psycopg.rows import dict_row

# Vercel gives us DATABASE_URL (Neon Postgres). Locally it's not set, so we use a SQLite file.
DATABASE_URL = os.environ.get("DATABASE_URL")
DB_PATH = os.path.join(os.path.dirname(__file__), "patients.db")


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


def create_table():
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
