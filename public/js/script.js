document.addEventListener("DOMContentLoaded", function () {
    const searchContainer = document.getElementById("search-container");
    const searchInput = document.getElementById("search-input");
    const resultsDiv = document.getElementById("results");
    const noResultsDiv = document.getElementById("no-results");

    searchInput.addEventListener("input", function () {
        filterResults(this.value);
    });

    function filterResults(query) {
        const items = resultsDiv.querySelectorAll("li");
        let hasResults = false;

        items.forEach((item) => {
            const name = item.querySelector("span").textContent.toLowerCase();
            if (name.includes(query.toLowerCase())) {
                item.style.display = "";
                item.closest("ul").style.display = ""; // Show parent folders
                hasResults = true;
            } else {
                item.style.display = "none";
            }
        });
        if (hasResults) {
            noResultsDiv.classList.add("hidden");
        } else {
            noResultsDiv.classList.remove("hidden");
        }
    }
    document
        .getElementById("file-upload-form")
        .addEventListener("submit", function (event) {
            event.preventDefault();

            let formData = new FormData(this);
            let loader = document.getElementById("loader");
            let resultsDiv = document.getElementById("results");
            let progressBarInner =
                document.getElementById("progress-bar-inner");
            let progressPercentage = document.getElementById(
                "progress-percentage"
            );

            // Show loader and hide results
            loader.classList.remove("hidden");
            resultsDiv.classList.add("hidden");
            searchContainer.classList.add("hidden");

            axios
                .post("/upload", formData, {
                    headers: {
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: function (progressEvent) {
                        let percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        progressBarInner.style.width = percentCompleted + "%";
                        progressPercentage.textContent = percentCompleted + "%";
                    },
                })
                .then((response) => {
                    resultsDiv.innerHTML = "";

                    if (response.data.error) {
                        resultsDiv.textContent = response.data.error;
                    } else if (response.data.structure) {
                        resultsDiv.innerHTML = renderFolderStructure(
                            response.data.structure
                        );
                        filterResults(searchInput.value);

                        // Show search input if results are present
                        if (resultsDiv.innerHTML.trim() !== "") {
                            searchContainer.classList.remove("hidden");
                        }
                    }

                    // Hide loader and show results
                    loader.classList.add("hidden");
                    resultsDiv.classList.remove("hidden");

                    // Add click event listeners to folder icons
                    document
                        .querySelectorAll(".folder-icon")
                        .forEach((icon) => {
                            icon.addEventListener("click", function () {
                                this.parentElement
                                    .querySelector(".folder-contents")
                                    .classList.toggle("hidden");
                                this.classList.toggle("fa-folder");
                                this.classList.toggle("fa-folder-open");
                            });
                        });

                    // Open the first folder by default
                    let firstFolderIcon =
                        document.querySelector(".folder-icon");
                    if (firstFolderIcon) {
                        firstFolderIcon.classList.add("fa-folder-open");
                        firstFolderIcon.classList.remove("fa-folder");
                        firstFolderIcon.parentElement
                            .querySelector(".folder-contents")
                            .classList.remove("hidden");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    resultsDiv.textContent =
                        "An error occurred while processing the request.";
                    // Hide loader and show results
                    loader.classList.add("hidden");
                    resultsDiv.classList.remove("hidden");
                });
        });
});
function renderFolderStructure(items, level = 0) {
    let html = '<ul class="no-list-style ml-' + level * 4 + '">';

    items.forEach((item) => {
        let iconClass =
            item.children && item.children.length > 0
                ? "folder-icon cursor-pointer"
                : "file-icon";
        let icon =
            item.children && item.children.length > 0
                ? '<i class="fas fa-folder ' + iconClass + '"></i>'
                : '<i class="' + getFileIconClass(item.name) + '"></i>';

        // Determine the size class
        let sizeClass = "";
        if (item.size) {
            // Extract numeric value from size
            const sizeMatch = item.size.match(/(\d+\.?\d*)\s*(B|KB|MB|GB)/);
            if (sizeMatch) {
                const sizeValue = parseFloat(sizeMatch[1]);
                const sizeUnit = sizeMatch[2];

                if (
                    sizeUnit === "B" ||
                    (sizeUnit === "KB" && sizeValue < 1000)
                ) {
                    sizeClass = "size-small";
                } else if (
                    sizeUnit === "KB" ||
                    (sizeUnit === "MB" && sizeValue < 100)
                ) {
                    sizeClass = "size-medium";
                } else {
                    sizeClass = "size-large";
                }
                sizeText =
                    '<span class="' + sizeClass + '">' + item.size + "</span>";
            }
        }

        html +=
            '<li class="text-gray-700 mb-2">' +
            icon +
            '<span class="ml-2">' +
            item.name +
            (sizeText ? " - " + sizeText : "") +
            "</span>";

        if (item.children && item.children.length > 0) {
            html += '<ul class="folder-contents ml-4 hidden">';
            html += renderFolderStructure(item.children, level + 1);
            html += "</ul>";
        }

        html += "</li>";
    });

    html += "</ul>";

    return html;
}

function getFileIconClass(fileName) {
    const ext = fileName.split(".").pop().toLowerCase();
    const icons = {
        mp4: "fa-regular fa-file-video",
        html: "fa-brands fa-html5",
        php: "fa-brands fa-php",
        js: "fa-brands fa-js",
        ts: "fa-solid fa-code",
        vue: "fa-brands fa-vuejs",
        mp3: "fa-solid fa-file-audio",
        jpeg: "fa-solid fa-file-image",
        jpg: "fa-solid fa-file-image",
        png: "fa-solid fa-file-image",
        json: "fa-solid fa-code",
        lock: "fa-solid fa-code",
        sqlite: "fa-solid fa-database",
        sql: "fa-solid fa-database",
        ico: "fa-solid fa-star",
        css: "fa-brands fa-css3",
        git: "fa-brands fa-git-alt",
        gitignore: "fa-brands fa-git-alt",
        env: "fa-solid fa-sliders",
        pdf: "fa-solid fa-file-pdf",
        docx: "fa-solid fa-file-word",
        doc: "fa-solid fa-file-word",
        xlsx: "fa-solid fa-file-excel",
        xls: "fa-solid fa-file-excel",
        zip: "fa-solid fa-file-zipper",
        rar: "fa-solid fa-file-zipper",
    };

    return icons[ext] || "fas fa-file";
}
