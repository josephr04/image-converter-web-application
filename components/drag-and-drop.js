/**
 * Drag-and-drop functionality for the upload box.
 * This code is currently not in use due to compatibility issues.
 * To enable it again, include this file and re-integrate the event listeners.
 */

// Handles the behavior when a user drags a file over the upload box
uploadBox.addEventListener("dragover", (e) => {
    if (convertedMessage.style.display === "flex") {
        return;
    }

    if (addedMessage.style.display === "flex") {
        dropMessage.style.display = "flex";
    } else {
        defaultMessage.style.display = "none";
        uploadButton.style.display = "none";
        dropMessage.style.display = "flex";
    }

    e.preventDefault();
    uploadBox.classList.add("dragover");
});

// Handles the behavior when the user stops dragging a file over the upload box
uploadBox.addEventListener("dragleave", (e) => {
    dropMessage.style.display = "none";
    if (addedMessage.style.display !== "flex") {
        defaultMessage.style.display = "flex";
        uploadButton.style.display = "flex";
    }
    uploadBox.classList.remove("dragover");
});

// Handles the behavior when files are dropped into the upload box
uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    dropMessage.style.display = "none";
    uploadBox.classList.remove("dragover");

    handleFiles(e.dataTransfer.files);

    addedMessage.style.display = "flex";
    defaultMessage.style.display = "none";
    uploadButton.style.display = "none";
});

