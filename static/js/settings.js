document.addEventListener("DOMContentLoaded", () => {
    setUpNameChangeButtonListener();
    setUpNameChangeDialogListener();
});

function setUpNameChangeButtonListener() {
    const button = document.getElementById("change_list_name");

    if (!button) {
        console.error(
            "Could not find button element with ID 'change_list_name'",
        );
        return;
    }

    button.addEventListener("click", () => {
        const dialog = document.getElementById("change_list_name_dialog");

        if (!dialog) {
            console.error(
                "Could not find dialog element with ID 'change_list_name_dialog'",
            );
            return;
        }

        dialog.showModal();
    });
}

function setUpNameChangeDialogListener() {
    const dialog = document.getElementById("change_list_name_dialog");

    if (!dialog) {
        console.error(
            "Could not find element with ID 'change_list_name_dialog'",
        );
        return;
    }

    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });
}
