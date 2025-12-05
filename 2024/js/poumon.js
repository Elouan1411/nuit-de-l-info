function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function checkAndUpdateBestScore(currentScore) {
    const bestScore = parseInt(getCookie("bestScore")) || 0;
    if (currentScore > bestScore) {
        setCookie("bestScore", currentScore, 365); // Conserver le score pendant 1 an
        console.log(`Nouveau meilleur score : ${currentScore}`);
        document.querySelector(".record").textContent = `Best score : ${currentScore}`;
    } else {
        console.log(`Score actuel : ${currentScore}. Meilleur score : ${bestScore}`);
    }
}

function copyText() {
    const textToCopy = "Lyreco";
    navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
            console.log("Texte copié: " + textToCopy);
        })
        .catch((err) => {
            console.error("Échec de la copie: ", err);
        });
}
document.addEventListener("DOMContentLoaded", () => {
    // Initialisation du score et de l'oxygène
    let score = 0;
    let oxygen = 100;
    const bestScore = parseInt(getCookie("bestScore")) || 0;
    document.querySelector(".record").textContent = `Best score : ${bestScore}`;

    // Sélection des éléments principaux
    const character = document.querySelector(".character");
    const gameContainer = document.querySelector(".container");
    const line = document.querySelector(".line");

    // Déplacements du personnage
    document.addEventListener("mousemove", (event) => {
        const lineRect = line.getBoundingClientRect();
        let x = event.clientX - lineRect.left; // Position relative à la ligne

        // Contraintes : empêcher de dépasser les limites de la ligne
        if (x < 0) x = 0;
        if (x > lineRect.width) x = lineRect.width;

        // Mise à jour de la position du personnage
        character.style.left = `${x}px`;
    });

    // Listes des images
    const imagesAlgues = ["../images/poumon/algue1.png", "../images/poumon/algue2.png", "../images/poumon/algue3.png", "../images/poumon/algue4.png"];

    const imagesDechets = [
        "../images/maree/dechet_1.png",
        "../images/maree/dechet_2.png",
        "../images/maree/dechet_3.png",
        "../images/maree/dechet_4.png",
        "../images/maree/dechet_5.png",
        "../images/maree/dechet_6.png",
        "../images/maree/dechet_7.png",
        "../images/maree/dechet_8.png",
        "../images/maree/dechet_9.png",
        "../images/maree/dechet_10.png",
        "../images/maree/dechet_11.png",
        "../images/maree/dechet_12.png",
        "../images/maree/dechet_13.png",
        "../images/maree/dechet_14.png",
    ];

    const imagesAnimaux = ["../images/poumon/meduse.png", "../images/poumon/tortue.png"];

    // Création des éléments mobiles
    function createMovingElement(className, imageArray) {
        const element = document.createElement("div");
        element.classList.add(className);

        // Choisir une image aléatoire
        const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];
        element.style.backgroundImage = `url(${randomImage})`;

        // Position horizontale aléatoire
        const randomX = window.innerWidth / 3 + Math.random() * (gameContainer.offsetWidth - 60);
        element.style.left = `${randomX}px`;

        // Ajouter l'élément à la zone
        gameContainer.appendChild(element);

        // Supprimer l'élément après l'animation
        element.addEventListener("animationend", () => {
            element.remove();
        });
    }

    function createMovingAlgue() {
        createMovingElement("moving-algues", imagesAlgues);
    }

    function createMovingDechet() {
        createMovingElement("moving-dechet", imagesDechets);
    }

    function createMovingAnimaux() {
        createMovingElement("moving-animaux", imagesAnimaux);
    }

    // Détection des collisions
    function isColliding(obj1, obj2) {
        const obj1Rect = obj1.getBoundingClientRect();
        const obj2Rect = obj2.getBoundingClientRect();

        return !(obj1Rect.right < obj2Rect.left || obj1Rect.left > obj2Rect.right || obj1Rect.bottom < obj2Rect.top || obj1Rect.top > obj2Rect.bottom);
    }

    function checkCollisions() {
        // Détecter les collisions avec les algues
        const algaeElements = document.querySelectorAll(".moving-algues");
        algaeElements.forEach((algae) => {
            if (isColliding(character, algae)) {
                console.log("Collision avec une algue détectée!");
                algae.remove();
                updateOxygenLevel();
            }
        });

        // Détecter les collisions avec les déchets
        const wasteElements = document.querySelectorAll(".moving-dechet");
        wasteElements.forEach((dechet) => {
            if (isColliding(character, dechet)) {
                console.log("Collision avec un déchet détectée!");
                dechet.remove();
                updateScore();
            }
        });

        // Détecter les collisions avec les animaux
        const animalsElements = document.querySelectorAll(".moving-animaux");
        animalsElements.forEach((animal) => {
            if (isColliding(character, animal)) {
                console.log("Collision avec un animal détectée!");
                animal.remove();
                tuerAnimal();
            }
        });
    }

    // Gestion des points et de l'oxygène
    let gameOver = false;

    function updateScore() {
        if (gameOver) return;
        score = Math.min(50, score + 1);
        document.querySelector(".balance").textContent = `Score : ${score}`;
        checkAndUpdateBestScore(score); // Vérifie et met à jour le meilleur score
        if (score >= 10) {
            endGame(
                "Félicitations ! Vous avez gagné 🎉 Les algues des océans produisent une grande partie de l'oxygène que nous respirons, ce qui en fait en quelque sorte les poumons de la Terre, purifiant ainsi l'atmosphère. Il est donc essentiel de les préserver. ",
                1
            );
        }
    }

    function tuerAnimal() {
        if (gameOver) return;
        score = Math.max(0, score - 3);
        document.querySelector(".balance").textContent = `Score : ${score}`;
    }

    function updateOxygenLevel() {
        if (gameOver) return;
        oxygen = Math.min(100, oxygen + 8);
        document.querySelector(".oxygentext").textContent = `Oxygen : ${oxygen}%`;
    }

    function decreaseValue() {
        if (gameOver) return;
        oxygen = Math.max(0, oxygen - 1);
        document.querySelector(".oxygentext").textContent = `Oxygen : ${oxygen}%`;
        if (oxygen <= 0) {
            endGame("Game Over !  Vous avez manqué d'oxygène.", 0);
        }
    }

    // Fonction pour terminer le jeu
    function endGame(message, scoreVal) {
        gameOver = true;

        // Supprimer tous les éléments animés
        document.querySelectorAll(".moving-algues, .moving-dechet, .moving-animaux").forEach((element) => {
            element.remove();
        });

        if (scoreVal > 0) {
            const cardWin = document.createElement("div");
            cardWin.classList.add("cardWin");
            cardWin.innerHTML = `
            <div class="containerWin">
                <div class="card">
                    <div class="header">
                    <p class="title">Terminal</p>
                    <button class="copy" onclick="copyText()">
                        <svg
                        class="w-[19px] h-[19px] text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path
                            fill-rule="evenodd"
                            d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z"
                            clip-rule="evenodd"
                            d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"
                            clip-rule="evenodd"
                        ></path>
                        </svg>
                    </button>
                    </div>

                    <div class="footer">
                    <div class="code">
                        <span class="icon">
                        <svg
                            class="w-[19px] h-[19px] text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="m9 5 7 7-7 7"
                            ></path>
                        </svg>
                        </span>
                        <p class="text">Felicitation ! 🎉</p>
                    </div>
                    <div class="code">
                        <span class="icon">
                        <svg
                            class="w-[19px] h-[19px] text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="m9 5 7 7-7 7"
                            ></path>
                        </svg>
                        </span>
                        <p class="text">Les algues des océans produisent une grande partie de l’oxygène que nous respirons !</p>
                    </div>
                    </div>
                </div>
                </div>

            `;
            document.body.appendChild(cardWin);

            // Ajouter des styles supplémentaires pour centrer et afficher la carte
            cardWin.style.position = "absolute";
            cardWin.style.top = "50%";
            cardWin.style.left = "50%";
            cardWin.style.transform = "translate(-50%, -50%)";
            cardWin.style.zIndex = "1000";
        } else {
            // Ajouter la pop-up au conteneur
            const terminalPopup = document.createElement("div");
            terminalPopup.innerHTML = `
            <div class="containerpopup">
                <div class="container_terminal"></div>
                <div class="terminal_toolbar">
                    <div class="butt">
                        <button class="btn btn-color"></button>
                        <button class="btn"></button>
                        <button class="btn"></button>
                    </div>
                    <p class="user">game@over: ~</p>
                </div>
                <div class="terminal_body">
                    <div class="terminal_promt">
                        <p>
                            <span class="terminal_user">game@over:</span>
                            <span class="terminal_location">~</span>
                            <span class="terminal_bling">$</span>
                            <span class="terminal_text">${message}</span>
                            <span class="terminal_cursor"></span>
                        </p>
                    </div>
                </div>
            </div>
        `;
            // Ajouter des styles pour centrer la pop-up
            terminalPopup.style.position = "absolute";
            terminalPopup.style.top = "50%";
            terminalPopup.style.left = "50%";
            terminalPopup.style.transform = "translate(-50%, -50%)";
            terminalPopup.style.zIndex = "1000";
            terminalPopup.style.width = "460px";
            terminalPopup.style.height = "388px";

            document.body.appendChild(terminalPopup);
        }

        // Arrêter les intervalles
        clearInterval(dechetInterval);
        clearInterval(algueInterval);
        clearInterval(animauxInterval);
        clearInterval(oxygenInterval);
        clearInterval(collisionInterval);
    }

    // Intervalles pour les animations et les mises à jour
    const dechetInterval = setInterval(createMovingDechet, 1500);
    const algueInterval = setInterval(createMovingAlgue, 2400);
    const animauxInterval = setInterval(createMovingAnimaux, 1000);
    const oxygenInterval = setInterval(decreaseValue, 200);
    const collisionInterval = setInterval(checkCollisions, 50);
});

const toggleButton = document.getElementById("toggleButton");
const messageBox = document.getElementById("messageBox");
let isMessage = false;

toggleButton.addEventListener("click", () => {
    if (!isMessage) {
        // Afficher le message
        messageBox.textContent =
            "Vous voilà en plongée sous-marine pour ramasser les déchets qui ont envahi les poumons d'Atlantis... Mais attention, votre jauge d'oxygène est limitée et le seul moyen de la remplir... C'est de manger des algues ! Ramassez des déchets pour gagner des points mais n'embêtez pas la faune sauvage car vous perdrez des points...";
        messageBox.style.display = "block";
        messageBox.style.backgroundColor = "#2ecc71";
        messageBox.style.color = "#111E2C";
        messageBox.style.border = "2px solid #27ae60";
        messageBox.style.padding = "15px 25px";
        messageBox.style.fontSize = "18px";
        messageBox.style.cursor = "default";
        toggleButton.textContent = "Revenir";
    } else {
        // Cacher le message
        messageBox.style.display = "none";
        messageBox.style.backgroundColor = "none";
        messageBox.style.color = "none";
        messageBox.style.border = "none";
        messageBox.style.padding = "none";
        messageBox.style.fontSize = "none";
        messageBox.style.cursor = "none";
        toggleButton.textContent = "?";
    }

    isMessage = !isMessage;
});
