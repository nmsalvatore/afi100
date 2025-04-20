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

    updateProgressBar();

    allFilmDivs.forEach((div) => {
        div.addEventListener("click", () => {
            const filmId = div.parentElement.dataset.filmId;
            toggleFilmWatchedStatus(div, filmId);
            updateProgressBar();
        });
    });

    const saveListButton = document.getElementById("save_list_button");

    if (!saveListButton) {
        console.error("Could not find element with ID 'save_list_button'");
        return;
    }

    saveListButton.addEventListener("click", openSaveListDialog);

    const saveForm = document.querySelector("form#save_list_form");

    if (saveForm) {
        saveForm.addEventListener("submit", function () {
            const watchedFilmIds = getWatchedFilmIds() || [];
            document.getElementById("watched_film_ids_input").value =
                JSON.stringify(watchedFilmIds);
        });
    }

    const saveListDialog = document.getElementById("save_list_dialog");

    if (!saveListDialog) {
        console.error("Could not find element with ID 'save_list_dialog'");
        return;
    }

    saveListDialog.addEventListener("click", (e) => {
        if (e.target == saveListDialog) {
            saveListDialog.close();
        }
    });

    function toggleFilmWatchedStatus(div, filmId) {
        const isWatched = div.dataset.watched === "true";

        div.dataset.watched = (!isWatched).toString();

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
            .filter((div) =>
                watchedIds.includes(div.parentElement.dataset.filmId),
            )
            .forEach((div) => {
                div.dataset.watched = "true";
            });
    }
});

function setWatchedFilmIds(filmIds) {
    localStorage.setItem("watched-film-ids", JSON.stringify(filmIds));
}

function getTotalFilmCount() {
    const filmRows = document.querySelectorAll("li.film");
    return filmRows.length;
}

function getWatchedFilmIds() {
    return JSON.parse(localStorage.getItem("watched-film-ids"));
}

function updateProgressBar() {
    const progressElement = document.getElementById("progress");
    const watchedFilmIds = getWatchedFilmIds() || [];
    const watchedCount = watchedFilmIds.length;
    const totalFilmCount = getTotalFilmCount();
    progressElement.textContent = `${watchedCount}/${totalFilmCount}`;
}

function openSaveListDialog() {
    const saveListDialog = document.getElementById("save_list_dialog");

    if (!saveListDialog) {
        console.error("Could not find element with id 'save_list_dialog'");
        return;
    }

    saveListDialog.showModal();
}
