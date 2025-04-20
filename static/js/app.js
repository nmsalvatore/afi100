const WATCHED_FILM_IDS_KEY = "watched-film-ids";

document.addEventListener("DOMContentLoaded", () => {
    setUpFilmDivListeners();
    setUpSaveListButtonListener();
    setUpSaveListDialogListener();
    setUpSaveListFormListener();
});

function setUpFilmDivListeners() {
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
}

function setUpSaveListButtonListener() {
    const saveListButton = document.getElementById("save_list_button");

    if (!saveListButton) {
        console.error("Could not find element with ID 'save_list_button'");
        return;
    }

    saveListButton.addEventListener("click", openSaveListDialog);

    function openSaveListDialog() {
        const saveListDialog = document.getElementById("save_list_dialog");

        if (!saveListDialog) {
            console.error("Could not find element with ID 'save_list_dialog'");
            return;
        }

        saveListDialog.showModal();
    }
}

function setUpSaveListDialogListener() {
    const saveListDialog = document.getElementById("save_list_dialog");

    if (!saveListDialog) {
        console.error("Could not find element with ID 'save_list_dialog'");
        return;
    }

    saveListDialog.addEventListener("click", (e) => {
        if (e.target === saveListDialog) {
            saveListDialog.close();
        }
    });
}

function setUpSaveListFormListener() {
    const saveForm = document.querySelector("form#save_list_form");

    if (!saveForm) {
        console.error("Could not find element with ID 'save_list_form'");
        return;
    }

    saveForm.addEventListener("submit", function () {
        const watchedFilmIds = getWatchedFilmIds() || [];
        document.getElementById("watched_film_ids_input").value =
            JSON.stringify(watchedFilmIds);
    });
}

function updateProgressBar() {
    const progressElement = document.getElementById("progress");

    if (!progressElement) {
        console.error("Could not find element with ID 'progress'");
        return;
    }

    const watchedFilmIds = getWatchedFilmIds() || [];
    const watchedCount = watchedFilmIds.length;
    const totalFilmCount = getTotalFilmCount();

    progressElement.textContent = `${watchedCount}/${totalFilmCount}`;

    function getTotalFilmCount() {
        const filmRows = document.querySelectorAll("li.film");
        return filmRows.length;
    }
}

function getWatchedFilmIds() {
    try {
        return JSON.parse(localStorage.getItem(WATCHED_FILM_IDS_KEY));
    } catch (error) {
        console.error(
            "Failed to parse watched film IDs from localStorage:",
            error,
        );
        return [];
    }
}

function setWatchedFilmIds(filmIds) {
    try {
        localStorage.setItem(WATCHED_FILM_IDS_KEY, JSON.stringify(filmIds));
    } catch (error) {
        console.error("Failed to set watched film IDs in localStorage", error);
    }
}
