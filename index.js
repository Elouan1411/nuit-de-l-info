// const express = require('express');
// const path = require('path');
// const app = express();
// const port = 45530;

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'windows.html'));
// });

// app.get('/linux', (req, res) => {
//     res.sendFile(path.join(__dirname, 'linux.html'));
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });

const PORT = process.env.PORT || 45530;
// Chargement des modules
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const { getOpenAIResponse } = require("./services/openaiService");
const multer = require("multer");
const fileService = require("./services/fileService");

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, fileService.UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        // Sanitize filename to prevent issues
        // We remove the timestamp to allow overwriting files with the same name
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        cb(null, safeName);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Configuration d'express pour utiliser le répertoire "public"
// C'est grâce à cette ligne que ton CSS/JS va charger
app.use(express.json());
app.use(express.static("public"));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Route 1 : La page d'accueil (Windows)
app.get("/", function (req, res) {
    // On pointe vers windows.html qui doit être DANS le dossier public
    res.sendFile(__dirname + "/public/windows.html");
});

app.post("/api/chat", async (req, res) => {
    const userMessage = req.body.message;
    const content = req.body.content;

    const botResponse = await getOpenAIResponse(userMessage, content);

    res.json({ response: botResponse });
});

// File Sharing Routes
app.get("/api/files", (req, res) => {
    const files = fileService.getFiles();
    const usage = fileService.getTotalSize();
    res.json({
        files: files,
        usage: usage,
        limit: fileService.MAX_STORAGE_SIZE,
    });
});

app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ error: "File too large. Server limit is 10MB." });
            }
            return res.status(500).json({ error: `Multer error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ error: `Unknown upload error: ${err.message}` });
        }

        // Everything went fine.
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        try {
            // Enforce storage limit after upload
            fileService.enforceStorageLimit();
            res.json({ message: "File uploaded successfully", file: req.file });
        } catch (limitError) {
            console.error("Storage limit error:", limitError);
            // Even if cleanup fails, the upload succeeded
            res.json({ message: "File uploaded (cleanup warning)", file: req.file, warning: "Storage cleanup failed" });
        }
    });
});

app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(fileService.UPLOADS_DIR, filename);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(fileService.UPLOADS_DIR)) {
        return res.status(403).send("Access denied");
    }

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send("File not found");
    }
});

app.delete("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    try {
        const success = fileService.deleteFile(filename);
        if (success) {
            res.json({ message: "File deleted successfully" });
        } else {
            res.status(404).json({ error: "File not found" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ne pas modifier le numéro du port (imposé par la Nuit de l'Info)
const server = app.listen(PORT, function () {
    console.log("C'est parti ! En attente de connexion sur le port 45530...");
    console.log("Se connecter à l'application en local : http://localhost:45530");
});
