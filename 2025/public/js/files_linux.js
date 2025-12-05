const fileGrid = document.getElementById("fileGrid");
const storageBar = document.getElementById("storageBar");
const storageText = document.getElementById("storageText");
const fileInput = document.getElementById("fileInput");

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function isImage(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
}

function isPdf(filename) {
    return filename.split(".").pop().toLowerCase() === "pdf";
}

async function renderPdfPreview(url, containerId) {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Style canvas to fit container
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.objectFit = "contain";

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = "";
            container.appendChild(canvas);
        }
    } catch (error) {
        console.error("Error rendering PDF:", error);
    }
}

async function fetchFiles() {
    try {
        const response = await fetch("../api/files");
        const data = await response.json();

        // Update Storage Bar
        const usagePercent = (data.usage / data.limit) * 100;
        storageBar.style.width = usagePercent + "%";
        storageText.textContent = `${formatBytes(data.usage)} / ${formatBytes(data.limit)}`;

        // Update File Grid
        fileGrid.innerHTML = "";
        if (data.files.length === 0) {
            fileGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">Aucun fichier partagé.</div>';
            return;
        }

        // Sort by date descending
        data.files.sort((a, b) => new Date(b.date) - new Date(a.date));

        data.files.forEach((file) => {
            const card = document.createElement("div");
            card.className = "file-card";

            let previewHtml = `<i class="fas fa-file"></i>`;
            const uniqueId = `preview-${Math.random().toString(36).substr(2, 9)}`;

            if (isImage(file.name)) {
                previewHtml = `<img src="../api/files/${file.name}" alt="${file.name}" loading="lazy">`;
            } else if (isPdf(file.name)) {
                previewHtml = `<div id="${uniqueId}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fas fa-spinner fa-spin"></i></div>`;
                // Trigger render after insertion
                setTimeout(() => renderPdfPreview(`../api/files/${file.name}`, uniqueId), 0);
            }

            card.innerHTML = `
                <div class="file-preview" onclick="window.open('../api/files/${file.name}', '_blank')">
                    ${previewHtml}
                </div>
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-meta">${formatBytes(file.size)}</div>
                <div class="file-actions">
                    <button class="action-btn" onclick="window.open('../api/files/${file.name}', '_blank')" title="Télécharger">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteFile('${file.name}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            fileGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching files:", error);
        storageText.textContent = "Erreur de connexion";
    }
}

async function deleteFile(filename) {
    if (!confirm(`Voulez-vous vraiment supprimer "${filename}" ?`)) return;

    try {
        const response = await fetch(`../api/files/${filename}`, {
            method: "DELETE",
        });

        if (response.ok) {
            fetchFiles();
        } else {
            alert("Erreur lors de la suppression");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("Erreur lors de la suppression");
    }
}

fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier est trop volumineux ! La taille maximum est de 5 Mo.");
        fileInput.value = "";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Show uploading state (simple alert for now or UI change)
    storageText.textContent = "Envoi en cours...";

    try {
        const response = await fetch("../api/upload", {
            method: "POST",
            body: formData,
        });

        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            console.warn("Non-JSON response received");
        }

        if (response.ok) {
            fetchFiles();
        } else {
            let errorMsg = result ? result.error : response.statusText;
            if (response.status === 413) {
                errorMsg = "Le fichier est trop volumineux pour le serveur (Limite Nginx).";
            }
            alert(`Échec de l'envoi : ${errorMsg} (Status: ${response.status})`);
        }
    } catch (error) {
        alert("Erreur d'envoi : " + error.message);
    } finally {
        fileInput.value = "";
    }
});

// Initial Load
fetchFiles();
// Auto-refresh
setInterval(fetchFiles, 10000);
