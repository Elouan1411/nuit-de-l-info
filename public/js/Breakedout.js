// --- VARIABLES DU JEU ---
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;
// Vitesse de déplacement

let moveLeft = false;
let moveRight = false;

// JOUEUR (RAQUETTE)
let playerWidth = 80;
let playerHeight = 20;

// NOUVELLES VARIABLES DE PHYSIQUE
let playerSpeed = 0; // Vitesse actuelle (démarre à 0)
let playerMaxSpeed = 15; // Vitesse maximum autorisée
let playerAccel = 1.5; // À quelle vitesse on accélère
let playerFriction = 0.85; // Résistance (0.9 = glace, 0.7 = sable)

let player = {
  x: boardWidth / 2 - playerWidth / 2,
  y: boardHeight - playerHeight - 5,
  width: playerWidth,
  height: playerHeight,
  // On n'a plus besoin de velocityX ici car on utilise les variables au-dessus
};

// BALLE
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 3; // Vitesse horizontale
let ballVelocityY = 2; // Vitesse verticale

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  width: ballWidth,
  height: ballHeight,
  velocityX: ballVelocityX,
  velocityY: ballVelocityY,
};

// BRIQUES
let brickArray = [];
let brickWidth = 50;
let brickHeight = 10;
let brickColumns = 6;
let brickRows = 3; // Nombre de rangées initiales
let brickMaxRows = 10; // Limite pour éviter de trop descendre
let brickCount = 0;

// Démarrage : positions X et Y pour le coin haut-gauche des briques
let brickX = 15;
let brickY = 45;

let score = 0;
let gameOver = false;

const colors = [
  "#FF00FF",
  "#00FF00",
  "#00FFFF",
  "#FFFF00",
  "#FF6600",
  "#9900FF",
  "#FF0066",
  "#3333FF",
  "#CC66FF",
  "#FF66CC",
  "#FF0000",
  "#CCFF00",
  "#00CC99",
  "#33CCFF",
  "#FFCC00",
];

let lastTime = 0;
const maxSpeed = 9;

// --- INITIALISATION ---
window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  context.imageSmoothingEnabled = false;
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  createBricks();
  requestAnimationFrame(update);
};

// --- BOUCLE PRINCIPALE (Mise à jour et Dessin) ---
function update(time) {
  requestAnimationFrame(update);
  if (gameOver) return;

  if (!lastTime) {
    lastTime = time;
  }

  let delta = (time - lastTime) / (1000 / 60);
  lastTime = time;

  context.clearRect(0, 0, board.width, board.height);

  // --- PHYSIQUE DU JOUEUR ---
  if (moveLeft) playerSpeed -= playerAccel;
  if (moveRight) playerSpeed += playerAccel;
  playerSpeed *= playerFriction;
  if (Math.abs(playerSpeed) < 0.1) playerSpeed = 0;

  // Cap vitesse joueur
  if (playerSpeed > playerMaxSpeed) playerSpeed = playerMaxSpeed;
  if (playerSpeed < -playerMaxSpeed) playerSpeed = -playerMaxSpeed;

  let nextX = player.x + playerSpeed * delta;

  if (nextX < 0) {
    nextX = 0;
    playerSpeed = 0;
  } else if (nextX + player.width > boardWidth) {
    nextX = boardWidth - player.width;
    playerSpeed = 0;
  }
  player.x = nextX;

  // --- DESSIN JOUEUR ---
  context.shadowBlur = 10;
  context.shadowColor = "#0f0";
  context.fillStyle = "#00FF00";
  context.fillRect(player.x, player.y, player.width, player.height);

  // --- PHYSIQUE BALLE ---
  context.fillStyle = "white";
  context.shadowColor = "white";
  context.shadowBlur = 15;

  // On applique le mouvement
  ball.x += ball.velocityX * delta;
  ball.y += ball.velocityY * delta;
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // --- GESTION DES MURS (CORRIGÉE ANTI-GLITCH) ---

  // Mur Gauche
  if (ball.x <= 0) {
    ball.x = 0; // <--- IMPORTANT : On la remet dans le terrain
    ball.velocityX *= -1;
  }
  // Mur Droit
  else if (ball.x + ball.width >= boardWidth) {
    ball.x = boardWidth - ball.width; // <--- IMPORTANT
    ball.velocityX *= -1;
  }

  // Plafond
  if (ball.y <= 0) {
    ball.y = 0; // <--- IMPORTANT
    ball.velocityY *= -1;
  }

  // Game Over
  if (ball.y + ball.height >= boardHeight) {
    context.font = "20px 'Press Start 2P'";
    context.fillStyle = "red";
    context.shadowColor = "red";
    context.fillText("GAME OVER", 140, 250);
    context.font = "12px 'Press Start 2P'";
    context.fillText("Appuyez sur 'espace' pour redémarrer", 100, 300);
    gameOver = true;
  }

  // --- COLLISION RAQUETTE (Avec accélération douce) ---
  if (detectCollision(ball, player)) {
    let ballCenter = ball.x + ball.width / 2;
    let paddleCenter = player.x + player.width / 2;
    let impactPoint = (ballCenter - paddleCenter) / (player.width / 2);
    let angle = impactPoint * (Math.PI / 3);

    let currentSpeed = Math.sqrt(
      ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY
    );

    // MODIFICATION ICI : On accélère moins fort (0.2 au lieu de 0.5)
    let newSpeed = currentSpeed + 0.2;

    // On limite la vitesse max (Anti-Glitch ultime)
    newSpeed = Math.min(newSpeed, maxSpeed);

    ball.velocityX = newSpeed * Math.sin(angle);
    ball.velocityY = -newSpeed * Math.cos(angle);

    ball.y = player.y - ball.height;
  }

  // --- COLLISION BRIQUES ---
  for (let i = 0; i < brickArray.length; i++) {
    let brick = brickArray[i];

    // On ne vérifie et dessine que les briques pas encore cassées
    if (!brick.break) {
      context.fillStyle = brick.color;
      context.shadowColor = brick.color;

      if (detectCollision(ball, brick)) {
        brick.break = true;
        resolveCollision(ball, brick);
        score += 100;
        brickCount--;

        // --- MODIFICATION TROLL ICI ---
        // On fait apparaître 2 nouvelles briques
        spawnTrollBrick();
        spawnTrollBrick();
        spawnTrollBrick();
        spawnTrollBrick();

        // --- MODIFICATION TROLL DEJA EXISTANTE ---
        spawnTrollBrick();
        spawnTrollBrick();
        spawnTrollBrick();
        spawnTrollBrick();

        // --- NOUVEAU : LE CRASH FATAL ---
        if (score > 50000) {
          // 1. On arrête le jeu
          gameOver = true;

          // 2. On affiche un message d'erreur effrayant (Windows style)
          parent.showError(
            "ERREUR FATALE:",
            " 0x889422\nException de mémoire surchargée.\n\nLimite du buffer excédée(50000). Le système va redémarrer pour prévenir des dommages systèmes."
          );

          // 3. On essaie de fermer la fenetre
          window.close();

          // 4. SOLUTION DE SECOURS (Si window.close est bloqué par le navigateur)
          // On remplace toute la page par un écran noir de la mort ou du vide
          document.body.innerHTML = "";
          document.body.style.backgroundColor = "black";

          // On lance une erreur JavaScript volontaire pour bloquer la console
          parent.showError("ERREUR FATALE:", "PARTIE CRASH AVEC SUCCÈS");
        }
      }

      // On dessine la brique
      context.fillRect(
        brick.x + 1,
        brick.y + 1,
        brick.width - 2,
        brick.height - 2
      );
    }
  }

  if (brickCount == 0) {
    score += 1000;
    brickRows = Math.min(brickRows + 1, brickMaxRows);
    createBricks();
  }

  context.font = "20px 'Press Start 2P'";
  context.fillStyle = "white";
  context.shadowColor = "white";
  context.fillText("SCORE: " + score, 10, 30);
}

// --- FONCTIONS UTILITAIRES ---

function handleKeyDown(e) {
  if (e.code == "ArrowLeft") {
    moveLeft = true;
  } else if (e.code == "ArrowRight") {
    moveRight = true;
  }
  // Espace pour recommencer ou lancer le jeu
  else if (e.code == "Space" && gameOver) {
    resetGame();
  }
}

function handleKeyUp(e) {
  if (e.code == "ArrowLeft") {
    moveLeft = false;
  } else if (e.code == "ArrowRight") {
    moveRight = false;
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function createBricks() {
  brickArray = [];
  let brickGap = 20;

  // 1. Calculer la largeur totale occupée par les briques
  // (Nombre de colonnes * Largeur brique) + (Nombre d'espaces * Largeur espace)
  let totalBrickWidth =
    brickColumns * brickWidth + (brickColumns - 1) * brickGap;

  // 2. Calculer le point de départ X pour que ce soit centré
  // (Largeur plateau - Largeur totale des briques) / 2
  let startX = (boardWidth - totalBrickWidth) / 2;

  for (let c = 0; c < brickColumns; c++) {
    for (let r = 0; r < brickRows; r++) {
      let brick = {
        x: startX + c * brickWidth + c * brickGap,

        y: brickY + r * brickHeight + r * brickGap,
        width: brickWidth,
        height: brickHeight,
        break: false,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      brickArray.push(brick);
    }
  }
  brickCount = brickArray.length;
}

function resetGame() {
  gameOver = false;
  playerSpeed = 0;
  player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
  };
  ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY,
  };
  brickArray = [];
  brickRows = 3;
  score = 0;
  createBricks();
}

// Fonction pour gérer le rebond (résoudre la collision)
// Elle détermine si on a tapé un côté horizontal ou vertical
function resolveCollision(ball, rect) {
  // 1. Calculer les chevauchements sur les 4 côtés
  let overlapLeft = ball.x + ball.width - rect.x;
  let overlapRight = rect.x + rect.width - ball.x;
  let overlapTop = ball.y + ball.height - rect.y;
  let overlapBottom = rect.y + rect.height - ball.y;

  // 2. Trouver le plus petit chevauchement sur chaque axe
  // On cherche à savoir si le choc est plutôt horizontal (X) ou vertical (Y)
  let minOverlapX = Math.min(overlapLeft, overlapRight);
  let minOverlapY = Math.min(overlapTop, overlapBottom);

  // 3. Décider du rebond
  // Si le chevauchement horizontal est plus petit que le vertical, c'est un choc latéral !
  if (minOverlapX < minOverlapY) {
    // Rebond horizontal : on inverse la vitesse X
    ball.velocityX *= -1;

    // ANTI-BUG : On replace la balle juste en dehors de l'objet pour éviter qu'elle ne reste coincée dedans
    if (overlapLeft < overlapRight) {
      ball.x = rect.x - ball.width;
    } else {
      ball.x = rect.x + rect.width;
    }
  }
  // Sinon, c'est un choc vertical (haut ou bas)
  else {
    // Rebond vertical : on inverse la vitesse Y (comme avant)
    ball.velocityY *= -1;

    // ANTI-BUG : Repositionnement
    if (overlapTop < overlapBottom) {
      ball.y = rect.y - ball.height;
    } else {
      ball.y = rect.y + rect.height;
    }
  }
}

function spawnTrollBrick() {
  // Position X aléatoire (en restant dans le cadre)
  let randomX = Math.floor(Math.random() * (boardWidth - brickWidth));

  // Position Y aléatoire (On garde une marge de 150px en bas pour la raquette)
  let randomY = Math.floor(Math.random() * boardHeight);

  let newBrick = {
    x: randomX,
    y: randomY,
    width: brickWidth,
    height: brickHeight,
    break: false,
    // Couleur aléatoire
    color: colors[Math.floor(Math.random() * colors.length)],
  };

  brickArray.push(newBrick);
  brickCount++; // On augmente le compteur pour que le jeu ne finisse jamais
}
