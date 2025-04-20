#!/usr/bin/env python3

import json
import nanoid
import os
import sqlite3
import string

from dotenv import load_dotenv
from flask import Flask, abort, make_response, redirect, render_template, request, url_for
from flask_wtf.csrf import CSRFProtect


load_dotenv()

DB_PATH = os.path.join("database", "db.sqlite3")
FILM_PATH = os.path.join("data", "afi_films.json")
DEFAULT_LIST_NAME = "The AFI 100 Challenge"

app = Flask(__name__)
app.config.from_prefixed_env()
app.config["SECRET_KEY"]

csrf = CSRFProtect(app)


def init_db():
    if not os.path.exists(DB_PATH):
        con = sqlite3.connect(DB_PATH)
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

        with open(FILM_PATH) as f:
            film_data = json.load(f)

        afi_films = [
            (film["id"], film["title"], film["year"], film["director"], 0)
            for film in film_data
        ]

        cur.executemany("INSERT INTO films VALUES (?, ?, ?, ?, ?)", afi_films)
        con.commit()
        con.close()


def get_db_connection():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def fetch_all_films():
    with get_db_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM films ORDER BY id")
        films = cur.fetchall()
        return films


def fetch_user_films(list_id):
    with get_db_connection() as con:
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
        return films


def fetch_user_list(list_id):
    with get_db_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM user_lists WHERE id = ?", (list_id,))
        user_list = cur.fetchone()
        return user_list


@app.route("/")
def index():
    films = fetch_all_films()
    return render_template("index.html", films=films)


@app.route("/<list_id>")
def view_private_list(list_id):
    with get_db_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT id, name FROM user_lists WHERE id = ?", (list_id,))

        user_list = cur.fetchone()

        if user_list is None:
            abort(404)

    films = fetch_user_films(list_id)
    return render_template("index.html", films=films, user_list=user_list)


@app.route("/toggle-watched/<list_id>/<int:film_id>", methods=["POST"])
def toggle_watched(list_id, film_id):
    with get_db_connection() as con:
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

    user_list = fetch_user_list(list_id)

    response = make_response(render_template("film.html", film=film, user_list=user_list))
    response.headers["HX-Trigger"] = "updateProgress"
    return response


@app.route("/progress/<list_id>", methods=["GET"])
def progress(list_id):
    films = fetch_user_films(list_id)
    user_list = fetch_user_list(list_id)
    return render_template("progress.html", films=films, user_list=user_list)


@app.route("/save-list", methods=["POST"])
def save_list():
    custom_chars = string.ascii_letters + string.digits

    with get_db_connection() as con:
        cur = con.cursor()

        while True:
            list_id = nanoid.generate(alphabet=custom_chars, size=8)
            cur.execute("SELECT 1 FROM user_lists WHERE id = ?", (list_id,))

            if cur.fetchone() is None:
                break

        list_name = request.form.get("custom_list_name") or DEFAULT_LIST_NAME
        cur.execute("INSERT INTO user_lists (id, name) VALUES (?, ?)", (list_id, list_name))

        watched_film_json = request.form.get("watched_film_ids")
        watched_film_ids = json.loads(watched_film_json)
        user_list_films = [(list_id, int(film_id), 1) for film_id in watched_film_ids]

        cur.executemany("INSERT INTO user_list_films (list_id, film_id, watched) VALUES (?, ?, ?)", user_list_films)
        con.commit()

    return redirect(url_for("view_private_list", list_id=list_id))


@app.route("/change-list-name/<list_id>", methods=["POST"])
def change_list_name(list_id):
    with get_db_connection() as con:
        cur = con.cursor()
        new_list_name = request.form.get("new_list_name") or DEFAULT_LIST_NAME
        cur.execute("UPDATE user_lists SET name = ? WHERE id = ?", (new_list_name, list_id))
        con.commit()
    return redirect(url_for("view_private_list", list_id=list_id))


@app.route("/delete-list/<list_id>", methods=["POST"])
def delete_list(list_id):
    with get_db_connection() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM user_lists WHERE id = ?", (list_id,))
        cur.execute("DELETE FROM user_list_films WHERE list_id = ?", (list_id,))
        con.commit()
    return redirect(url_for("index"))


with app.app_context():
    init_db()


if __name__ == "__main__":
    app.run(debug=True, port=8000)
