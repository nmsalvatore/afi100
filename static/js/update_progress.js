document.body.addEventListener("updateProgress", () => {
    htmx.ajax("GET", "/progress", { target: "#progress" });
});
