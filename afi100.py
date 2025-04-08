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


def fetch_user_films(list_id):
    con = sqlite3.connect("db.sqlite3")
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        SELECT
            f.id,
            f.title,
            f.year,
            f.director,
            COALESCE(ulf.watched, 0) as watched
        FROM
            films f
        LEFT JOIN
            user_list_films ulf ON f.id = ulf.film_id AND ulf.list_id = ?
        ORDER BY
            f.id
    """, (list_id,))
    films = cur.fetchall()
    con.close()
    return films


@app.route("/")
def index():
    films = fetch_all_films()
    return render_template("index.html", films=films, progress_display=progress_display)


@app.route("/<list_id>")
def view_private_list(list_id):
    films = fetch_user_films(list_id)
    return render_template("index.html", films=films, progress_display=progress_display, list_id=list_id)


@app.route("/toggle-watched/<list_id>/<int:film_id>", methods=["POST"])
def toggle_watched(list_id, film_id):
    con = sqlite3.connect("db.sqlite3")
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    cur.execute("SELECT watched FROM user_list_films WHERE list_id = ? AND film_id = ?", (list_id, film_id))
    user_film_status = cur.fetchone()

    if user_film_status is None:
        cur.execute("INSERT INTO user_list_films VALUES (?, ?, ?)", (list_id, film_id, 1))
    else:
        updated_status = 1 if user_film_status[0] == 0 else 0
        cur.execute("UPDATE user_list_films SET watched = ? WHERE list_id = ? AND film_id = ?", (updated_status, list_id, film_id))

    con.commit()
    cur.execute("""
        SELECT
            f.id,
            f.title,
            f.year,
            f.director,
            COALESCE(ulf.watched, 0) as watched
        FROM
            films f
        LEFT JOIN
            user_list_films ulf ON f.id = ulf.film_id AND ulf.list_id = ?
        WHERE
            f.id = ?
    """, (list_id, film_id))
    film = cur.fetchone()
    con.close()

    response = make_response(render_template("film.html", film=film, list_id=list_id))
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
    list_id = nanoid.generate(alphabet=custom_chars, size=8)
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

    return redirect(url_for('view_private_list', list_id=list_id))


with app.app_context():
    init_db()


if __name__ == "__main__":
    app.run(debug=True, port=8000)
