const fileList = document.getElementById("fileList");
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

async function fetchFiles() {
    try {
        const response = await fetch("../api/files");
        const data = await response.json();

        const usagePercent = (data.usage / data.limit) * 100;
        storageBar.style.width = usagePercent + "%";
        storageText.textContent = `${formatBytes(data.usage)} / ${formatBytes(data.limit)}`;

        fileList.innerHTML = "";
        if (data.files.length === 0) {
            fileList.innerHTML = '<div style="padding:20px;text-align:center;color:#666;">No files shared yet.</div>';
            return;
        }

        data.files.sort((a, b) => new Date(b.date) - new Date(a.date));

        data.files.forEach((file) => {
            const div = document.createElement("div");
            div.className = "file-item";
            div.onclick = () => window.open(`../api/files/${file.name}`, "_blank");

            let iconEmoji = "📄";
            const ext = file.name.split(".").pop().toLowerCase();

            if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
                iconEmoji = "🖼️";
            }

            const iconHtml = `
                <div class="file-icon-container">
                    <div class="file-icon">${iconEmoji}</div>
                    <div class="preview-overlay">Aperçu<br>impossible<br>Win10</div>
                </div>
            `;

            div.innerHTML = `
                ${iconHtml}
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">${formatBytes(file.size)} • ${new Date(file.date).toLocaleString("fr-FR")}</div>
                </div>
                <div class="action-btn" onclick="event.stopPropagation(); parent.showError('Erreur Système', 'Fonctionnalité non supportée sur Windows 10');">🗑️</div>
                <div class="action-btn">⬇️</div>
            `;
            fileList.appendChild(div);
        });
    } catch (error) {
        console.error("Error fetching files:", error);
        storageText.textContent = "Error connecting to server";
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

    const btn = document.querySelector(".upload-btn");
    const originalText = btn.textContent;
    btn.textContent = "Uploading...";
    btn.disabled = true;

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
            console.error("Upload failed status:", response.status, response.statusText);
            let errorMsg = result ? result.error : response.statusText;

            if (response.status === 413) {
                errorMsg = "Le fichier est trop volumineux pour le serveur (Limite Nginx).";
            }

            alert(`Échec de l'envoi : ${errorMsg} (Status: ${response.status})`);
        }
    } catch (error) {
        alert("Erreur d'envoi : " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
        fileInput.value = "";
    }
});

fetchFiles();
setInterval(fetchFiles, 10000);
