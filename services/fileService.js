const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const MAX_STORAGE_SIZE = 1024 * 1024 * 1024; // 1GB

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const getFiles = () => {
    try {
        const files = fs.readdirSync(UPLOADS_DIR);
        return files.map((filename) => {
            const filePath = path.join(UPLOADS_DIR, filename);
            const stats = fs.statSync(filePath);
            return {
                name: filename,
                size: stats.size,
                date: stats.mtime,
            };
        });
    } catch (error) {
        console.error("Error reading uploads directory:", error);
        return [];
    }
};

const getTotalSize = () => {
    const files = getFiles();
    return files.reduce((acc, file) => acc + file.size, 0);
};

const enforceStorageLimit = () => {
    let currentSize = getTotalSize();

    if (currentSize <= MAX_STORAGE_SIZE) return;

    const files = getFiles().sort((a, b) => a.date - b.date); // Oldest first

    for (const file of files) {
        if (currentSize <= MAX_STORAGE_SIZE) break;

        try {
            fs.unlinkSync(path.join(UPLOADS_DIR, file.name));
            currentSize -= file.size;
            console.log(`Deleted old file to free space: ${file.name}`);
        } catch (err) {
            console.error(`Failed to delete file ${file.name}:`, err);
        }
    }
};

const deleteFile = (filename) => {
    const filePath = path.join(UPLOADS_DIR, filename);

    // Security check
    if (!filePath.startsWith(UPLOADS_DIR)) {
        throw new Error("Invalid filename");
    }

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

module.exports = {
    getFiles,
    getTotalSize,
    enforceStorageLimit,
    deleteFile,
    UPLOADS_DIR,
    MAX_STORAGE_SIZE,
};
