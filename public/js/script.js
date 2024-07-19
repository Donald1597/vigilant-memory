document
    .getElementById("file-upload-form")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        let formData = new FormData(this);
        let loader = document.getElementById("loader");
        let resultsDiv = document.getElementById("results");
        let progressBarInner = document.getElementById("progress-bar-inner");
        let progressPercentage = document.getElementById("progress-percentage");

        // Show loader and hide results
        loader.classList.remove("hidden");
        resultsDiv.classList.add("hidden");

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
                }

                // Hide loader and show results
                loader.classList.add("hidden");
                resultsDiv.classList.remove("hidden");
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

function renderFolderStructure(items, level = 0) {
    let html = '<ul class="no-list-style ml-' + level * 4 + '">';

    items.forEach((item) => {
        let iconClass =
            item.children && item.children.length > 0
                ? "folder-icon"
                : "file-icon";
        let icon =
            item.children && item.children.length > 0
                ? '<i class="fas fa-folder ' + iconClass + '"></i>'
                : '<i class="' + getFileIconClass(item.name) + '"></i>';

        html +=
            '<li class="text-gray-700 mb-2">' +
            icon +
            '<span class="ml-2">' +
            item.name +
            (item.size ? " - " + item.size : "");

        if (item.children && item.children.length > 0) {
            html += renderFolderStructure(item.children, level + 1);
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
