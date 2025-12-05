const windowsusage = document.querySelector(".windowsusage");

let intervalId;

if (windowsusage) {
    intervalId = setInterval(() => ramUsage(87, 108), 700);
} else {
    intervalId = setInterval(() => ramUsage(12, 24), 2500);
}

const SESAME = ["notepad", "motdepasse", "mdp", "1234", "root", "nuitdelinfo", "sesame", "meci", "000000", "0000", "000", "12345", "123456", "admin"];
const NOTEPAD_ICON = document.getElementById("notepad-icon");
let isNotepadUnlocked = false;

function openApp(title, url) {
    const windowDiv = document.createElement("div");
    windowDiv.className = "window";
    windowDiv.style.left = "50px";
    windowDiv.style.top = "50px";
    console.log(title);
    console.log("Title == musique: ", title === "Music Player");

    windowDiv.innerHTML = `
        <div class="window-header" ${title == "Text Editor" ? `id="text-editor-window"` : ""}>
            <span>${title}</span>
            <div>
                <button class="maximize-btn" onclick="maximizeWindow(this)">□</button>
                <button class="close-btn" onclick="this.closest('.window').remove()">X</button>
            </div>
        </div>
        <div class="window-content">
            <iframe src="${url}" onload="this.contentWindow.focus()"></iframe>
        </div>
        <div class="resizer top-left"></div>
        <div class="resizer top-right"></div>
        <div class="resizer bottom-left"></div>
        <div class="resizer bottom-right"></div>
        <div class="resizer top"></div>
        ${title === "Music Player" ? "" : `<div class="resizer bottom"></div>`}
        <div class="resizer left"></div>
        <div class="resizer right"></div>
    `;

    document.body.appendChild(windowDiv);
    makeDraggable(windowDiv);
    makeResizable(windowDiv);
    return windowDiv;
}

function openAssistant() {
    // Check if already open
    const existing = Array.from(document.querySelectorAll(".window-header span")).find((s) => s.textContent === "Windows Assistant");
    if (existing) {
        const win = existing.closest(".window");
        win.remove(); // Toggle: close if open
        return;
    }

    const win = openApp("Windows Assistant", "./apps/chatbot.html");

    // Style as a search pane/assistant
    win.style.top = "auto";
    win.style.bottom = "50px"; // Above taskbar
    win.style.left = "0px";
    win.style.width = "400px";
    win.style.height = "600px";
    win.style.minHeight = "400px";
    win.style.boxShadow = "5px 0 15px rgba(0,0,0,0.2)";

    // Remove maximize button for this specific app
    const maxBtn = win.querySelector(".maximize-btn");
    if (maxBtn) maxBtn.remove();
}

function makeDraggable(element) {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    const header = element.querySelector(".window-header");

    if (header) {
        header.onmousedown = dragMouseDown;
    } else {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;

        // Bring to front
        document.querySelectorAll(".window").forEach((w) => (w.style.zIndex = 1));
        element.style.zIndex = 100;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = element.offsetTop - pos2 + "px";
        element.style.left = element.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function makeResizable(element) {
    const resizers = element.querySelectorAll(".resizer");
    const minWidth = 200;
    const minHeight = 150;

    resizers.forEach((resizer) => {
        resizer.addEventListener("mousedown", function (e) {
            e.preventDefault();

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            const startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
            const startLeft = element.offsetLeft;
            const startTop = element.offsetTop;

            const onMouseMove = (e) => {
                if (resizer.classList.contains("bottom-right")) {
                    const width = startWidth + (e.clientX - startX);
                    const height = startHeight + (e.clientY - startY);
                    if (width > minWidth) element.style.width = width + "px";
                    if (height > minHeight) element.style.height = height + "px";
                } else if (resizer.classList.contains("bottom-left")) {
                    const width = startWidth - (e.clientX - startX);
                    const height = startHeight + (e.clientY - startY);
                    if (width > minWidth) {
                        element.style.width = width + "px";
                        element.style.left = startLeft + (e.clientX - startX) + "px";
                    }
                    if (height > minHeight) element.style.height = height + "px";
                } else if (resizer.classList.contains("top-right")) {
                    const width = startWidth + (e.clientX - startX);
                    const height = startHeight - (e.clientY - startY);
                    if (width > minWidth) element.style.width = width + "px";
                    if (height > minHeight) {
                        element.style.height = height + "px";
                        element.style.top = startTop + (e.clientY - startY) + "px";
                    }
                } else if (resizer.classList.contains("top-left")) {
                    const width = startWidth - (e.clientX - startX);
                    const height = startHeight - (e.clientY - startY);
                    if (width > minWidth) {
                        element.style.width = width + "px";
                        element.style.left = startLeft + (e.clientX - startX) + "px";
                    }
                    if (height > minHeight) {
                        element.style.height = height + "px";
                        element.style.top = startTop + (e.clientY - startY) + "px";
                    }
                }
                // Edges
                else if (resizer.classList.contains("right")) {
                    const width = startWidth + (e.clientX - startX);
                    if (width > minWidth) element.style.width = width + "px";
                } else if (resizer.classList.contains("bottom")) {
                    const height = startHeight + (e.clientY - startY);
                    if (height > minHeight) element.style.height = height + "px";
                } else if (resizer.classList.contains("top")) {
                    const height = startHeight - (e.clientY - startY);
                    if (height > minHeight) {
                        element.style.height = height + "px";
                        element.style.top = startTop + (e.clientY - startY) + "px";
                    }
                } else if (resizer.classList.contains("left")) {
                    const width = startWidth - (e.clientX - startX);
                    if (width > minWidth) {
                        element.style.width = width + "px";
                        element.style.left = startLeft + (e.clientX - startX) + "px";
                    }
                }
            };

            const onMouseUp = () => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        });
    });
}

function maximizeWindow(btn) {
    const windowDiv = btn.closest(".window");
    if (windowDiv.classList.contains("maximized")) {
        windowDiv.classList.remove("maximized");
        windowDiv.style.width = windowDiv.dataset.prevWidth;
        windowDiv.style.height = windowDiv.dataset.prevHeight;
        windowDiv.style.top = windowDiv.dataset.prevTop;
        windowDiv.style.left = windowDiv.dataset.prevLeft;
    } else {
        windowDiv.dataset.prevWidth = windowDiv.style.width || "400px";
        windowDiv.dataset.prevHeight = windowDiv.style.height || "300px";
        windowDiv.dataset.prevTop = windowDiv.style.top;
        windowDiv.dataset.prevLeft = windowDiv.style.left;

        windowDiv.classList.add("maximized");
        windowDiv.style.width = "100%";
        windowDiv.style.height = "calc(100% - 30px)"; // Account for RAM bar
        windowDiv.style.top = "30px";
        windowDiv.style.left = "0";
    }
}

function installLinux() {
    const overlay = document.createElement("div");
    overlay.id = "terminal-overlay";
    document.body.appendChild(overlay);
    overlay.style.display = "block";

    const lines = [
        " Formatage du lecteur C:... ",
        " Suppression de System32... ",
        " Installation du noyau Linux... ",
        " Configuration du gestionnaire de paquets... ",
        " Compilation des pilotes... ",
        " Installation terminée. ",
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < lines.length) {
            const p = document.createElement("p");
            p.textContent = `> ${lines[i]}`;
            overlay.appendChild(p);
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                window.location.href = "./linux.html";
            }, 1000);
        }
    }, 800);
}

function ramUsage(min, max) {
    const usage = document.querySelector(".pourcentage");
    const rambar = document.querySelector(".ram-bar");

    const number = min + Math.floor(Math.random() * (max - min));

    if (usage) {
        usage.innerHTML = number;
        rambar.style.width = number + "%";
    }
}

// Taskbar Clock
function updateClock() {
    const timeElement = document.querySelector(".taskbar-time");
    const dateElement = document.querySelector(".taskbar-date");

    if (timeElement && dateElement) {
        const now = new Date();

        // Time: HH:MM (24h)
        const timeString = now.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
        timeElement.textContent = timeString;

        // Date: DD/MM/YYYY
        const dateString = now.toLocaleDateString("fr-FR");
        dateElement.textContent = dateString;
    }
}

function showError(title, message) {
    const errDiv = document.createElement("div");
    errDiv.style.position = "fixed";
    // Random position if not critical start menu error
    if (title === "Explorer.exe") {
        errDiv.style.top = "50%";
        errDiv.style.left = "50%";
        errDiv.style.transform = "translate(-50%, -50%)";
    } else {
        errDiv.style.top = Math.random() * (window.innerHeight - 200) + "px";
        errDiv.style.left = Math.random() * (window.innerWidth - 400) + "px";
    }

    errDiv.style.background = "#fff";
    errDiv.style.border = "1px solid #0078d7";
    errDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    errDiv.style.zIndex = 10000;
    errDiv.style.width = "400px";
    errDiv.style.fontFamily = '"Segoe UI", sans-serif';
    errDiv.style.padding = "0";
    errDiv.style.display = "flex";
    errDiv.style.flexDirection = "column";

    errDiv.innerHTML = `
        <div style="padding: 10px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; color: #000;">${title}</span>
            <button onclick="this.closest('div').parentElement.remove()" style="border: none; background: none; font-size: 16px; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 20px; display: flex; align-items: flex-start;">
            <div style="font-size: 32px; color: #e81123; margin-right: 15px;">❌</div>
            <div>
                <div style="margin-bottom: 10px; font-size: 14px;">Erreur critique</div>
                <div style="font-size: 14px; color: #333;">${message}</div>
            </div>
        </div>
        <div style="padding: 15px; background: #f0f0f0; display: flex; justify-content: flex-end; border-top: 1px solid #dfdfdf;">
            <button onclick="this.closest('div').parentElement.remove()" style="padding: 5px 20px; border: 1px solid #adadad; background: #e1e1e1; cursor: pointer; font-family: inherit; font-size: 12px;">Fermer</button>
        </div>
    `;
    document.body.appendChild(errDiv);
}

function showStartMenuError() {
    showError("Explorer.exe", "Le menu Démarrer a cessé de fonctionner. Nous allons essayer de corriger ce problème dans Windows 11.");
}

function showClockError() {
    showError("Horloge Système", "Windows 10 ne supporte plus cette fonction.");
}

setInterval(updateClock, 1000);
updateClock(); // Initial call

function goToNotepad() {
    window.location.href = "./apps/notepad_windows.html";
}

function ramUsage(min, max) {
    const usage = document.querySelector(".pourcentage");
    const rambar = document.querySelector(".ram-bar");

    const number = min + Math.floor(Math.random() * (max - min));

    if (usage) {
        usage.innerHTML = number;
        console.log(rambar);
        rambar.style.width = number + "%";
    }
}
function tryOpenNotepad() {
    if (isNotepadUnlocked) {
        openApp("Notepad", "./apps/windows/notepad.html");
        return;
    }

    const passwordWindow = document.createElement("div");
    passwordWindow.className = "window password-prompt";
    passwordWindow.style.left = "30%";
    passwordWindow.style.top = "30%";

    passwordWindow.innerHTML = `
        <div class="window-header">
            <span>Authentification Requise</span>
            <div>
                <button class="close-btn" onclick="this.closest('.window').remove()">X</button>
            </div>
        </div>
        <div class="window-content" style="padding: 15px; background: #c0c0c0;">
            <p>Veuillez saisir la séquence de déverrouillage du Bloc-notes :</p>
            <input type="text" id="password-input" placeholder="Saisir le code ici..." 
                   style="width: 90%; margin-bottom: 10px; padding: 3px; border: 1px inset black;">
            <div style="text-align: right;">
                <button id="submit-password-btn" class="password-btn">OK</button>
                <button onclick="this.closest('.window').remove()" class="password-btn">Annuler</button>
            </div>
        </div>
    `;

    document.body.appendChild(passwordWindow);
    makeDraggable(passwordWindow);

    const passwordInput = passwordWindow.querySelector("#password-input");
    const submitButton = passwordWindow.querySelector("#submit-password-btn");

    setTimeout(() => passwordInput.focus(), 100);

    submitButton.onclick = checkPassword;
    passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            checkPassword();
        }
    });

    function checkPassword() {
        console.log("Check Password");
        const inputCode = passwordInput.value.toUpperCase();

        if (SESAME.includes(inputCode.toLowerCase())) {
            passwordWindow.remove();
            unlockNotepad();
            openApp("Notepad", "./apps/windows/notepad.html");
        } else {
            passwordInput.value = "";
            passwordInput.focus();
        }
    }
}

function unlockNotepad() {
    if (!isNotepadUnlocked) {
        isNotepadUnlocked = true;

        if (NOTEPAD_ICON) {
            NOTEPAD_ICON.classList.remove("locked");
            NOTEPAD_ICON.classList.add("unlocked");
        }
    }
}
