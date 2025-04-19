document.addEventListener("DOMContentLoaded", (e) => {
    const savedTheme = localStorage.getItem("theme");

    if (!savedTheme) {
        return;
    }

    switch (savedTheme) {
        case "dark-mode":
            setDarkMode();
            break;
        case "light-mode":
            setLightMode();
            break;
    }
});

function toggleTheme() {
    const htmlElement = getHTMLElement();
    const currentTheme = htmlElement.dataset.theme;

    switch (currentTheme) {
        case "dark-mode":
            setLightMode();
            break;
        case "light-mode":
            setDarkMode();
            break;
    }
}

function setLightMode() {
    const htmlElement = getHTMLElement();
    htmlElement.dataset.theme = "light-mode";
    setButtonText("Switch to dark mode");
    setThemeColorMetaTag("hsl(210 10% 94%)");
    localStorage.setItem("theme", "light-mode");
}

function setDarkMode() {
    const document = getHTMLElement();
    document.dataset.theme = "dark-mode";
    setButtonText("Switch to light mode");
    setThemeColorMetaTag("hsl(210 25% 20%)");
    localStorage.setItem("theme", "dark-mode");
}

function setButtonText(text) {
    const button = document.getElementById("theme_toggler");

    if (!button) {
        console.error("Could not find theme toggle button");
        return;
    }

    button.textContent = text;
}

function setThemeColorMetaTag(color) {
    const metaTag = document.querySelector("meta[name='theme-color']");

    if (!metaTag) {
        console.error("Could not find meta tag with name 'theme-color'");
    }

    metaTag.content = color;
}

function getHTMLElement() {
    const htmlDocument = document.documentElement;

    if (!htmlDocument) {
        console.error("Could not find HTML document element");
        return;
    }

    return htmlDocument;
}
