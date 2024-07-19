document.addEventListener("DOMContentLoaded", function () {
    const searchContainer = document.getElementById("search-container");
    const searchInput = document.getElementById("search-input");
    const resultsDiv = document.getElementById("results");
    const noResultsDiv = document.getElementById("no-results");
    const form = document.getElementById("file-upload-form");
    const loader = document.getElementById("loader");
    const progressBarInner = document.getElementById("progress-bar-inner");
    const progressPercentage = document.getElementById("progress-percentage");

    searchInput.addEventListener("input", () =>
        filterResults(searchInput.value)
    );

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        handleFormSubmit(new FormData(form));
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

        noResultsDiv.classList.toggle("hidden", hasResults);
    }

    function handleFormSubmit(formData) {
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
                onUploadProgress: updateProgress,
            })
            .then(handleUploadResponse)
            .catch(handleUploadError);
    }

    function updateProgress(progressEvent) {
        const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
        );
        progressBarInner.style.width = `${percentCompleted}%`;
        progressPercentage.textContent = `${percentCompleted}%`;
    }

    function handleUploadResponse(response) {
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
        addFolderIconListeners();

        // Open the first folder by default
        openFirstFolder();
    }

    function handleUploadError(error) {
        console.error("Error:", error);
        resultsDiv.textContent =
            "An error occurred while processing the request.";
        loader.classList.add("hidden");
        resultsDiv.classList.remove("hidden");
    }

    function addFolderIconListeners() {
        document.querySelectorAll(".folder-icon").forEach((icon) => {
            icon.addEventListener("click", function () {
                const folderContents =
                    this.parentElement.querySelector(".folder-contents");
                folderContents.classList.toggle("hidden");
                this.classList.toggle("fa-folder");
                this.classList.toggle("fa-folder-open");
            });
        });
    }

    function openFirstFolder() {
        const firstFolderIcon = document.querySelector(".folder-icon");
        if (firstFolderIcon) {
            firstFolderIcon.classList.add("fa-folder-open");
            firstFolderIcon.classList.remove("fa-folder");
            firstFolderIcon.parentElement
                .querySelector(".folder-contents")
                .classList.remove("hidden");
        }
    }

    function renderFolderStructure(items, level = 0) {
        return `<ul class="no-list-style ml-${level * 4}">
            ${items
                .map((item) => {
                    const isFolder = item.children && item.children.length > 0;
                    const iconClass = isFolder
                        ? "folder-icon cursor-pointer"
                        : "file-icon";
                    const icon = isFolder
                        ? `<i class="fas fa-folder ${iconClass}"></i>`
                        : `<i class="${getFileIconClass(item.name)}"></i>`;

                    const sizeText = item.size ? getSizeText(item.size) : "";

                    return `
                    <li class="text-gray-700 mb-2">
                        ${icon}
                        <span class="ml-2">${item.name}${
                        sizeText ? ` - ${sizeText}` : ""
                    }</span>
                        ${
                            isFolder
                                ? `<ul class="folder-contents ml-4 hidden">${renderFolderStructure(
                                      item.children,
                                      level + 1
                                  )}</ul>`
                                : ""
                        }
                    </li>`;
                })
                .join("")}
        </ul>`;
    }

    function getSizeText(size) {
        const sizeMatch = size.match(/(\d+\.?\d*)\s*(B|KB|MB|GB)/);
        if (sizeMatch) {
            const sizeValue = parseFloat(sizeMatch[1]);
            const sizeUnit = sizeMatch[2];
            const sizeClass =
                sizeUnit === "B" || (sizeUnit === "KB" && sizeValue < 1000)
                    ? "size-small"
                    : sizeUnit === "KB" ||
                      (sizeUnit === "MB" && sizeValue < 100)
                    ? "size-medium"
                    : "size-large";

            return `<span class="${sizeClass}">${size}</span>`;
        }
        return "";
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
});
