async function copyURL() {
    try {
        const url = getURL();
        await navigator.clipboard.writeText(url);
        const copiedText = await navigator.clipboard.readText();

        if (copiedText === url) {
            setCopyURLText("Copied!");
            setTimeout(() => {
                setCopyURLText("Copy URL");
            }, 5000);
        }
    } catch (err) {
        console.error("Failed to copy URL:", err);
    }
}

function getURL() {
    const urlElement = document.getElementById("url");

    if (!urlElement) {
        console.error("Could not find span#url");
        return;
    }

    return urlElement.textContent;
}

function setCopyURLText(text) {
    const copyURLButton = document.getElementById("copy_url");

    if (!copyURLButton) {
        console.error("Could not find button#copy_url");
        return;
    }

    switch (text) {
        case "Copied!":
            copyURLButton.classList.add("copied");
            break;
        case "Copy URL":
            if (copyURLButton.classList.contains("copied")) {
                copyURLButton.classList.remove("copied");
            }
            break;
    }

    copyURLButton.textContent = text;
}
