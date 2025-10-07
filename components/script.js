/**
 * ===========================================
 * Main Script for Image Converter Application
 * ===========================================
 * This script manages the core functionality of the image conversion application, 
 * including file uploads, file validation, dynamic UI updates, and backend integration.
 * 
 * Features:
 * - Drag-and-drop and manual file uploads
 * - File validation for size, type, and limits
 * - Dynamic creation of file cards for uploaded images
 * - Format selection and dropdown handling
 * - Backend communication for image conversion
 * - Downloadable converted files, including bulk downloads as ZIP
 * - User-friendly UI with real-time feedback and processing indicators
 * 
 * Author: Joseph Rosas
 * Last Updated: 12/6/2024
 * Version: 1.0
 */

// DOM references
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("file-upload");
const fileContainer = document.querySelector(".file-container");
const deleteAllButton = document.getElementById("delete-all");
const convertButton = document.getElementById("convert-all");
const options = document.getElementById("options");
const form = document.getElementById('image-converter-form');

// Visual Messages
const defaultMessage = document.querySelector(".default-message");
const dropMessage = document.querySelector(".drop-message")
const addedMessage = document.querySelector(".added-message");
const convertedMessage = document.querySelector(".converted-message");
const uploadButton = document.getElementById("custom-file-upload");

// Dropdowns and select
const dropdown = document.querySelector(".drop-down");
const list = document.querySelector(".list");
const selected = document.querySelector(".selected");
const selectedImg = document.querySelector(".selectedImg");
const dropDownFormat = document.querySelector(".drop-down-format");
const listFormats = document.querySelector(".list-formats");
const selectedFormat = document.querySelector(".selectedF");

// Initial configuration
const backendBaseURL = "https://image-converter-web-application.onrender.com";
const maxFiles = 10;
const maxSize = 10 * 1024 * 1024;
let formatSelected = "jpg";
let fileInfoArray = [];

// Displays a different message in the upload box based on whether the user has uploaded a file
function updateMessages(hasFiles) {
    defaultMessage.style.display = hasFiles ? "none" : "flex";
    addedMessage.style.display = hasFiles ? "flex" : "none";
}

// Generates a file card for each file uploaded by the user, displaying file details and options
function createFileCard(file, src) {
    const fileCard = document.createElement("div");
    fileCard.className = "file-card";
    fileCard.dataset.fileName = file.name;

    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2); // Converts the file size from bytes to megabytes (MB) for display

    fileCard.innerHTML = `
        <img src="${src}" alt="${file.name}" class="file-icon">
        <div class="file-details">
            <h4>${file.name}</h4>
            <h5 class="file-size" style="display: inline-block;">${fileSizeMB} MB</h5>
        </div>
        <button class="delete-icon" aria-label="Eliminar archivo">&times;</button>
    `;

    fileCard.querySelector(".delete-icon").addEventListener("click", () => {
        fileCard.remove();
        if (!fileContainer.children.length) {
            updateMessages(false);
            options.style.display = "none";
            fileContainer.style.display = "none";
        }
    });

    fileContainer.appendChild(fileCard);
}

// Displays the 'Download All' button when more than one file is present, allowing the user to download all files at once
function toggleDownloadAllButton(fileInfoArray) {
    const downloadAllLink = document.getElementById("download-all-container");

    if (fileInfoArray.length > 1) {
        downloadAllLink.style.display = "flex";
    } else {
        downloadAllLink.style.display = "none";
    }
}

// Lógica para eliminar todos los archivos
deleteAllButton.addEventListener("click", () => {
    fileContainer.innerHTML = "";
    options.style.display = "none";
    fileContainer.style.display = "none";
    updateMessages(false); // Volver al mensaje predeterminado
});

// Handles the 'Download All' button click event, creates a ZIP file containing all the converted images, and triggers the download
document.querySelector('.download-all-link').addEventListener('click', async (e) => {

    e.preventDefault();

    const zip = new JSZip();
    const folder = zip.folder("converted_images");

    for (const file of fileInfoArray) {
        const normalizedPath = file.filePath.replace(/\\/g, '/');
        const fullPath = `${backendBaseURL}${normalizedPath}`;

        // This gets the files from the backend and adds them to the ZIP folder
        const response = await fetch(fullPath);
        if (response.ok) {
            const blob = await response.blob();
            folder.file(file.newName, blob);
        } else {
            console.error(`Error fetching file: ${file.newName}`);
            alert(`Failed to fetch file: ${file.newName}`);
            return;
        }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = "converted_images.zip";
    downloadLink.click();
});

// Updates the file cards with new information and adds a 'Download' button for each file
function updateFileCardsForDownload(fileInfoArray) {
    fileInfoArray.forEach(({ originalName, newName, filePath }) => {
        const $existingCard = $(`[data-file-name="${originalName}"]`);
        const shortName = newName.replace('converted/', '');

        if ($existingCard.length) {
            // Updates the file card with the new file details
            $existingCard.find(".file-details h4").text(shortName);
            $existingCard.find(".file-details h5")
                .text("Done!")
                .css("color", "green");
            $existingCard.find(".delete-icon").remove();

            // Adds a download link if it doesn't already exist
            if (!$existingCard.find(".download-link").length) {
                const normalizedPath = filePath.replace(/\\/g, '/');
                const fullPath = `${backendBaseURL}${normalizedPath}`;

                const downloadLink = $("<a>")
                    .addClass("download-link")
                    .html('<i class="fas fa-download"></i> Download')
                    .attr("href", fullPath)
                    .attr("download", newName);

                $existingCard.append(downloadLink);
            }
        }
        
        uploadButton.style.display = "none";
        addedMessage.style.display = "none";
        convertedMessage.style.display = "flex";

    });
    toggleDownloadAllButton(fileInfoArray);
}

// Checks files based on size, type, and number of files to ensure they meet the required conditions
function handleFiles(files) {
    const currentFilesCount = fileContainer.children.length;
    const remainingSlots = maxFiles - currentFilesCount;
    let hasValidFiles = false;

    if (files.length > maxFiles) {
        alert("You can only convert 10 images at a time.");
        return;
    }

    if (files.length > remainingSlots) {
        alert(`You can only add ${remainingSlots} more images.`);
        return;
    }

    Array.from(files).forEach(file => {
        if (file.size > maxSize) {
            alert(`${file.name} exceeds the 10 MB size limit.`);
            return;
        }

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = e => createFileCard(file, e.target.result);
            reader.readAsDataURL(file);
            hasValidFiles = true;
        }
    });

    // If there is no issue, this displays the convertion options and updates the message in the upload box 
    if (hasValidFiles) {
        updateMessages(true);
        options.style.display = "flex";
        fileContainer.style.display = "flex";
    }
}

// Manages the functionality of the 'Upload' box based on the current message displayed
uploadBox.addEventListener("click", (e) => {
    // If the 'Converted' message is being displayed, reloads the page
    if (convertedMessage.style.display === "flex") {
        location.reload();
        return;
    }
    // Otherwise, continues with the usual file input behavior
    if (!["INPUT", "LABEL"].includes(e.target.tagName)) {
        fileInput.click();
        e.preventDefault();
    }
});

// This manages the file selection process
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

// Toggles the visibility of the language dropdown when clicked
dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
    list.classList.toggle("show");
});

document.addEventListener("click", () => list.classList.remove("show"));

// Handles actions triggered when a language is selected from the dropdown menu
list.addEventListener("click", (e) => {
    const itemL = e.target.closest(".itemL");
    if (itemL) {
        selectedImg.src = itemL.querySelector("img").src;
        selected.innerHTML = itemL.querySelector(".text").innerHTML;
        list.classList.remove("show");
        console.log("Próximamente versión en Español!");
    }
});

// Toggles the visibility of the format dropdown when clicked
dropDownFormat.addEventListener("click", (e) => {
    e.stopPropagation();
    listFormats.classList.toggle("show");
});

// Updates the selected format attribute based on the user's choice from the dropdown list
listFormats.addEventListener("click", (e) => {
    const itemF = e.target.closest(".itemF");
    if (itemF) {
        formatSelected = itemF.getAttribute("data-format");
        selectedFormat.textContent = formatSelected.toUpperCase();
        listFormats.classList.remove("show");
    }
});

document.addEventListener("click", () => listFormats.classList.remove("show"));

// This submits the images to the backend and starts the conversion
form.addEventListener('submit', async (event) => {

    startProcessing();

    event.preventDefault();
    const files = fileInput.files;

    if (!files.length) {
        alert("Select at least one file!");
        return;
    }

    if (files.length > maxFiles) {
        alert("You cannot convert more than 10 images at a time");
        return;
    }

    const formData = new FormData();
    const originalFileNames = [];

    // Stores the original file names to match each file with its corresponding card
    Array.from(files).forEach(file => {
        originalFileNames.push(file.name);
        formData.append("images", file);
    });

    formData.append("format", formatSelected);

    try {
        const response = await fetch(`${backendBaseURL}convert/`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'An unknown error occurred');
        }
        
        const result = await response.json();

        fileInfoArray = result.files.map((filePath, index) => {
            const newName = filePath.split('\\').pop();
            return {
                originalName: originalFileNames[index],
                newName,
                filePath,
            };
        });

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

// This starts a processing animation and updates file cards after a delay
function startProcessing() {
    
    const options = document.getElementById("options");
    const processing = document.getElementById('processing-container');

    options.style.display = "none";
    processing.style.display = "flex";

    setTimeout(() => {
        processing.style.display = "none";
        updateFileCardsForDownload(fileInfoArray);
    }, 3000);
}
