#!/usr/bin/env python3

import json
import os
import sqlite3

from flask import Flask, render_template, make_response


app = Flask(__name__)

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


with app.app_context():
    init_db()


if __name__ == "__main__":
    app.run(debug=True, port=8000)
