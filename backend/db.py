import os
import sqlite3

import psycopg
from psycopg.rows import dict_row

# DATABASE_URL is set on Vercel (Neon). When running locally we use a sqlite file instead.
DATABASE_URL = os.environ.get("DATABASE_URL")
SQLITE_PATH = os.path.join(os.path.dirname(__file__), "patients.db")


def get_connection():
    if DATABASE_URL:
        return psycopg.connect(DATABASE_URL, row_factory=dict_row)

    connection = sqlite3.connect(SQLITE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def run_query(sql, params=()):
    # sqlite uses ? for parameters, postgres uses %s
    if DATABASE_URL:
        sql = sql.replace("?", "%s")

    connection = get_connection()
    try:
        cursor = connection.execute(sql, params)
        rows = []
        if cursor.description:
            rows = [dict(row) for row in cursor.fetchall()]
        connection.commit()
        return rows
    finally:
        connection.close()


def create_table():
    if DATABASE_URL:
        id_column = "id SERIAL PRIMARY KEY"
    else:
        id_column = "id INTEGER PRIMARY KEY AUTOINCREMENT"

    run_query(f"""
        CREATE TABLE IF NOT EXISTS patients (
            {id_column},
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            ward TEXT NOT NULL,
            department TEXT NOT NULL,
            doctor TEXT NOT NULL,
            admission_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Admitted'
        )
    """)
