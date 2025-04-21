document.addEventListener("DOMContentLoaded", setUpSettingsEventListeners);

function setUpSettingsEventListeners() {
    try {
        setUpNameChangeListeners();
        setUpDeleteListListeners();
    } catch (error) {
        console.error("Error setting up event listeners:", error);
    }
}

function setUpNameChangeListeners() {
    setUpNameChangeButtonListener();
    setUpNameChangeDialogListeners();
}

function setUpDeleteListListeners() {
    setUpDeleteListButtonListener();
    setUpDeleteListDialogListener();
}

function setUpNameChangeButtonListener() {
    const button = document.getElementById("change_list_name_button");

    if (!button) {
        throw TypeError(
            "Could not find button element with ID 'change_list_name_button'",
        );
    }

    button.addEventListener("click", () => {
        const dialog = document.getElementById("change_list_name_dialog");

        if (!dialog) {
            throw new TypeError(
                "Could not find dialog element with ID 'change_list_name_dialog'",
            );
        }

        dialog.showModal();
    });
}

function setUpNameChangeDialogListeners() {
    const dialog = document.getElementById("change_list_name_dialog");

    if (!dialog) {
        throw new TypeError(
            "Could not find element with ID 'change_list_name_dialog'",
        );
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

function setUpDeleteListButtonListener() {
    const button = document.getElementById("delete_list_button");

    if (!button) {
        throw new TypeError(
            "Could not find element with ID 'delete_list_button'",
        );
    }

    button.addEventListener("click", () => {
        const dialog = document.getElementById("delete_list_dialog");

        if (!dialog) {
            throw new TypeError(
                "Could not find element with ID 'delete_list_dialog'",
            );
        }

        dialog.showModal();
    });
}

function setUpDeleteListDialogListener() {
    const dialog = document.getElementById("delete_list_dialog");

    if (!dialog) {
        throw new TypeError(
            "Could not find element with ID 'delete_list_dialog'",
        );
    }

    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });
}
