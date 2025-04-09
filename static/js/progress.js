document.body.addEventListener("updateProgress", () => {
    const listId = document.body.dataset.listId;
    htmx.ajax("GET", `/progress/${listId}`, { target: "#progress" });
});
