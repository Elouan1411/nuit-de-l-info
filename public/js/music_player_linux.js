document.addEventListener("DOMContentLoaded", function () {
  // --- Formater le nom des fichiers ---
  function formatFilename(file) {
    let name = file
      .replace(/-\d+\.mp3$/, "") // enlever numéro + extension
      .replace(/[-_]/g, " "); // remplacer tirets et underscores par espace
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); // majuscule première lettre
  }

  const playlist = [
    "cascade-breathe-future-garage-412839.mp3",
    "deep-abstract-ambient_snowcap-401656.mp3",
    "groovy-vibe-427121.mp3",
    "hype-drill-music-438398.mp3",
    "sweet-life-luxury-chill-438146.mp3",
    "the-last-point-beat-electronic-digital-394291.mp3",
    "future-design-344320.mp3",
    "retro-lounge-389644.mp3",
    "tell-me-what-379638.mp3",
    "sandbreaker-379630.mp3",
    "embrace-364091.mp3",
    "vlog-beat-background-349853.mp3",
  ];

  const ul = document.getElementById("playlist");
  const audioPlayer = document.getElementById("audio-player");
  const playBtn = document.getElementById("play-btn");
  const precBtn = document.getElementById("prec-btn");
  const skipBtn = document.getElementById("skip-btn");
  const progressBar = document.querySelector(".progress-bar");
  const timePassed = document.querySelector(".time-passed");
  const timeRemaining = document.querySelector(".time-remaining");
  const vinyle = document.querySelector(".turning-vinyle img");

  let currentIndex = 0;
  let isPlaying = false;

  // --- Remplir la playlist ---
  playlist.forEach((file, index) => {
    const li = document.createElement("li");
    li.textContent = formatFilename(file);
    li.dataset.index = index;
    li.onclick = () => playMusic(index);
    ul.appendChild(li);
  });

  const listOfLi = document.querySelectorAll("li");
  listOfLi.forEach((li) => {
    li.addEventListener("click", () => {
      listOfLi.forEach((li2) => li2.classList.remove("selected"));
      li.classList.add("selected");
    });
  });

  // --- Fonction pour jouer une musique ---
  function playMusic(index) {
    currentIndex = index;
    const filename = playlist[currentIndex];
    audioPlayer.src = `../../assets/music/${filename}`;
    audioPlayer.play();
    isPlaying = true;
    updatePlayButton();
    updateSelectedLi();
    updateVinyleRotation(true);
    musicNameEl.textContent = formatFilename(filename);
  }

  // --- Mettre à jour l'élément sélectionné ---
  function updateSelectedLi() {
    listOfLi.forEach((li) => li.classList.remove("selected"));
    listOfLi[currentIndex].classList.add("selected");
  }

  // --- Gestion boutons ---
  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      audioPlayer.pause();
      isPlaying = false;
      updateVinyleRotation(false);
    } else {
      audioPlayer.play();
      isPlaying = true;
      updateVinyleRotation(true);
    }
    updatePlayButton();
  });

  precBtn.addEventListener("click", () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    playMusic(currentIndex);
  });

  skipBtn.addEventListener("click", () => {
    currentIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    playMusic(currentIndex);
  });

  function updatePlayButton() {
    if (isPlaying) {
      playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>`; // tu peux remplacer par ton SVG pause
    } else {
      playBtn.innerHTML = `<svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path
                d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
              />
            </svg>`;
    }
  }

  // --- Mettre à jour la barre de progression ---
  audioPlayer.addEventListener("timeupdate", () => {
    const duration = audioPlayer.duration || 0;
    const currentTime = audioPlayer.currentTime;

    const progressPercent = (currentTime / duration) * 100;
    document.querySelector(".progress-bar").style.width = `${progressPercent}%`;

    document.querySelector(".time-passed").textContent =
      formatTime(currentTime);
    document.querySelector(".time-remaining").textContent = formatTime(
      duration - currentTime
    );
  });

  // --- Passer au morceau suivant automatiquement ---
  audioPlayer.addEventListener("ended", () => {
    currentIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    playMusic(currentIndex);
  });

  // --- Formater le temps en mm:ss ---
  function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  // --- Vinyle qui tourne ---
  let rotationInterval;
  function updateVinyleRotation(start) {
    if (start) {
      vinyle.style.animation = "spin 4s linear infinite";
    } else {
      vinyle.style.animation = "none";
    }
  }

  // --- Animation CSS pour le vinyle ---
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  const musicNameEl = document.querySelector(".music-name h4");
  playMusic(0);
});
