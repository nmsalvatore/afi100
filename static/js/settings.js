document.addEventListener("DOMContentLoaded", setUpSettingsEventListeners);

function setUpSettingsEventListeners() {
    try {
        setUpNameChangeListeners();
        setUpDeleteListListeners();
    } catch (error) {
        console.error("Error adding event listeners:", error);
    }
}

function setUpNameChangeListeners() {
    setUpNameChangeButtonListener();
    setUpNameChangeDialogListener();
}

function setUpDeleteListListeners() {
    setUpDeleteListButtonListener();
    setUpDeleteListDialogListener();
}

function setUpNameChangeButtonListener() {
    const button = document.getElementById("change_list_name_button");

    if (!button) {
        throw Error(
            "Could not find button element with ID 'change_list_name_button'",
        );
    }

    button.addEventListener("click", () => {
        const dialog = document.getElementById("change_list_name_dialog");

        if (!dialog) {
            throw new Error(
                "Could not find dialog element with ID 'change_list_name_dialog'",
            );
        }

        dialog.showModal();
    });
}

function setUpNameChangeDialogListener() {
    const dialog = document.getElementById("change_list_name_dialog");

    if (!dialog) {
        throw new Error(
            "Could not find element with ID 'change_list_name_dialog'",
        );
    }

    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });
}

function setUpDeleteListButtonListener() {
    const button = document.getElementById("delete_list_button");

    if (!button) {
        throw new Error("Could not find element with ID 'delete_list_button'");
    }

    button.addEventListener("click", () => {
        const dialog = document.getElementById("delete_list_dialog");

        if (!dialog) {
            throw new Error(
                "Could not find element with ID 'delete_list_dialog'",
            );
        }

        dialog.showModal();
    });
}

function setUpDeleteListDialogListener() {
    const dialog = document.getElementById("delete_list_dialog");

    if (!dialog) {
        throw new Error("Could not find element with ID 'delete_list_dialog'");
    }

    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });
}
