const allFilmDivs = document.querySelectorAll("li.film > div");

if (allFilmDivs.length === 0) {
    throw Error("Could not find elements containing film info");
}

document.addEventListener("DOMContentLoaded", () => {
    const watchedFilmIds = JSON.parse(localStorage.getItem("watched-film-ids"));
    if (watchedFilmIds && watchedFilmIds.length > 0) {
        Array.from(allFilmDivs)
            .filter((div) =>
                watchedFilmIds.includes(div.parentElement.dataset.id),
            )
            .forEach((div) => {
                div.parentElement.dataset.watched = "true";
            });
    }
});

allFilmDivs.forEach((div) => {
    div.addEventListener("click", () => {
        const filmId = div.parentElement.dataset.id;
        const isWatched = div.parentElement.dataset.watched;

        div.parentElement.dataset.watched =
            isWatched == "false" ? "true" : "false";

        const watchedFilmIds = JSON.parse(
            localStorage.getItem("watched-film-ids"),
        );

        if (!watchedFilmIds) {
            localStorage.setItem("watched-film-ids", JSON.stringify([filmId]));
        } else if (watchedFilmIds.find((id) => id == filmId)) {
            localStorage.setItem(
                "watched-film-ids",
                JSON.stringify(watchedFilmIds.filter((id) => id != filmId)),
            );
        } else {
            watchedFilmIds.push(filmId);
            watchedFilmIds.sort((a, b) => Number(a) - Number(b));
            localStorage.setItem(
                "watched-film-ids",
                JSON.stringify(watchedFilmIds),
            );
        }
    });
});
