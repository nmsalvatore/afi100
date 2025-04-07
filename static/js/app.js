document.addEventListener("DOMContentLoaded", () => {
    const allFilmDivs = document.querySelectorAll("li.film > div");

    if (allFilmDivs.length === 0) {
        console.error("Could not find elements containing film info");
        return;
    }

    const watchedFilmIds = getWatchedFilmIds() || [];
    if (watchedFilmIds.length > 0) {
        updateElementDataAttributes(watchedFilmIds);
    }
    updateProgressBar(allFilmDivs.length);

    allFilmDivs.forEach((div) => {
        div.addEventListener("click", () => {
            const filmId = div.parentElement.dataset.id;
            toggleFilmWatchedStatus(div, filmId);
            updateProgressBar(allFilmDivs.length);
        });
    });

    const saveForm = document.querySelector("form#save_list_form");
    if (saveForm) {
        saveForm.addEventListener("submit", function () {
            const watchedFilmIds = getWatchedFilmIds() || [];
            document.getElementById("watched_film_ids_input").value =
                JSON.stringify(watchedFilmIds);
        });
    }

    function toggleFilmWatchedStatus(div, filmId) {
        const li = div.parentElement;
        const isWatched = li.dataset.watched === "true";
        li.dataset.watched = (!isWatched).toString();

        const watchedFilmIds = getWatchedFilmIds() || [];

        if (isWatched) {
            setWatchedFilmIds(watchedFilmIds.filter((id) => id != filmId));
        } else {
            if (!watchedFilmIds.includes(filmId)) {
                watchedFilmIds.push(filmId);
                watchedFilmIds.sort((a, b) => Number(a) - Number(b));
                setWatchedFilmIds(watchedFilmIds);
            }
        }
    }

    function updateElementDataAttributes(watchedIds) {
        Array.from(allFilmDivs)
            .filter((div) => watchedIds.includes(div.parentElement.dataset.id))
            .forEach((div) => {
                div.parentElement.dataset.watched = "true";
            });
    }
});

function setWatchedFilmIds(filmIds) {
    localStorage.setItem("watched-film-ids", JSON.stringify(filmIds));
}

function getWatchedFilmIds() {
    return JSON.parse(localStorage.getItem("watched-film-ids"));
}

function updateProgressBar(totalFilms) {
    const progressElement = document.getElementById("progress");
    const watchedFilmIds = getWatchedFilmIds() || [];
    progressElement.textContent = `${watchedFilmIds.length}/${totalFilms}`;
}
