#!/usr/bin/env python3

import json
import nanoid
import os
import sqlite3
import string

from flask import Flask, make_response, redirect, render_template, request, url_for
from flask_wtf.csrf import CSRFProtect


app = Flask(__name__)
app.config.from_mapping(
    SECRET_KEY="dev"
)
csrf = CSRFProtect(app)


progress_display = "fraction"


def init_db():
    if not os.path.exists("db.sqlite3"):
        con = sqlite3.connect("db.sqlite3")
        cur = con.cursor()

        cur.execute("""
            CREATE TABLE films (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                year INTEGER,
                director TEXT,
                watched INTEGER DEFAULT 0
            )
        """)

        cur.execute("""
            CREATE TABLE user_lists (
                id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                name TEXT
            )
        """)

        cur.execute("""
            CREATE TABLE user_list_films (
                list_id TEXT,
                film_id INTEGER,
                watched INTEGER DEFAULT 0,
                PRIMARY KEY (list_id, film_id),
                FOREIGN KEY (list_id) REFERENCES user_lists(id),
                FOREIGN KEY (film_id) REFERENCES films(id)
            )
        """)

        with open("data/afi_films.json") as f:
            film_data = json.load(f)

        afi_films = [
            (film["id"], film["title"], film["year"], film["director"], 0)
            for film in film_data
        ]

        cur.executemany("INSERT INTO films VALUES (?, ?, ?, ?, ?)", afi_films)
        con.commit()
        con.close()


def fetch_all_films():
    con = sqlite3.connect("db.sqlite3")
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("SELECT * FROM films ORDER BY id")
    films = cur.fetchall()
    con.close()
    return films


@app.route("/")
def index():
    films = fetch_all_films()
    return render_template("index.html", films=films, progress_display=progress_display)


@app.route("/list")
def view_private_list():
    films = fetch_all_films()
    return render_template("index.html", films=films, progress_display=progress_display)


@app.route("/toggle-watched/<int:id>", methods=["POST"])
def toggle_watched(id):
    con = sqlite3.connect("db.sqlite3")
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    cur.execute("SELECT watched FROM films WHERE id = ?", (id,))
    current_status = cur.fetchone()[0]
    updated_status = 1 if current_status == 0 else 0
    cur.execute("UPDATE films SET watched = ? WHERE id = ?", (updated_status, id))
    con.commit()

    cur.execute("SELECT * FROM films WHERE id = ?", (id,))
    film = cur.fetchone()
    con.close()

    response = make_response(render_template("film.html", film=film))
    response.headers["HX-Trigger"] = "updateProgress"
    return response


@app.route("/progress", methods=["GET"])
def progress():
    films = fetch_all_films()
    return render_template("progress_tracker.html", films=films)


@app.route("/toggle-progress-display")
def toggle_progress_display():
    global progress_display
    progress_display = "fraction" if progress_display == "percentage" else "percentage"
    films = fetch_all_films()
    return render_template("progress_tracker.html", films=films, progress_display=progress_display)


@app.route("/save-list", methods=["POST"])
def save_list():
    custom_chars = string.ascii_letters + string.digits
    list_id = nanoid.generate(alphabet=custom_chars, size=10)
    watched_film_json = request.form.get("watched_film_ids")
    watched_film_ids = json.loads(watched_film_json)
    user_list_films = [(list_id, int(film_id), 1) for film_id in watched_film_ids]

    con = sqlite3.connect("db.sqlite3")
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("INSERT INTO user_lists (id) VALUES (?)", (list_id,))
    cur.executemany("INSERT INTO user_list_films (list_id, film_id, watched) VALUES (?, ?, ?)", user_list_films)
    con.commit()
    con.close()

    return redirect(url_for('view_private_list', id=list_id))


with app.app_context():
    init_db()


if __name__ == "__main__":
    app.run(debug=True, port=8000)
