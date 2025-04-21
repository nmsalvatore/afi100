const WATCHED_FILM_IDS_KEY = "watched-film-ids";

document.addEventListener("DOMContentLoaded", () => {
    setUpFilmDivListeners();
    setUpSaveListButtonListener();
    setUpSaveListDialogListeners();
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
    const button = document.getElementById("save_list_button");

    if (!button) {
        console.error("Could not find element with ID 'save_list_button'");
        return;
    }

    button.addEventListener("click", openSaveListDialog);

    function openSaveListDialog() {
        const dialog = document.getElementById("save_list_dialog");

        if (!dialog) {
            console.error("Could not find element with ID 'save_list_dialog'");
            return;
        }

        dialog.showModal();
    }
}

function setUpSaveListDialogListeners() {
    const dialog = document.getElementById("save_list_dialog");

    if (!dialog) {
        console.error("Could not find element with ID 'save_list_dialog'");
        return;
    }

    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });

    window.visualViewport.addEventListener("resize", () => {
        const keyboardHeight = Math.round(
            window.innerHeight - window.visualViewport.height,
        );
        const toolbarHeight = Math.round(window.visualViewport.offsetTop);
        const bottomPosition =
            toolbarHeight > 0 ? keyboardHeight - toolbarHeight : keyboardHeight;

        if (dialog.open && keyboardHeight > 0) {
            dialog.style.position = "fixed";
            dialog.style.bottom = `${bottomPosition}px`;
            dialog.style.top = "auto";
            dialog.style.margin = "1rem";
            dialog.style.transform = "translateY(0)";
        }

        if (keyboardHeight <= 0 && dialog.getAttribute("style")) {
            dialog.removeAttribute("style");
        }
    });
}

function setUpSaveListFormListener() {
    const form = document.getElementById("save_list_form");

    if (!form) {
        console.error("Could not find element with ID 'save_list_form'");
        return;
    }

    form.addEventListener("submit", function () {
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
