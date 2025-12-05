document.addEventListener("DOMContentLoaded", function () {
  function randomCharacter() {
    const random = Math.floor(Math.random() * 93) + 33;

    return String.fromCharCode(random);
  }
  let text = "";
  let textarea = document.querySelector("textarea");
  textarea.addEventListener("input", () => {
    let random = Math.floor(Math.random() * 20);
    if (random == 1) {
      textarea.value =
        textarea.value.length + 5 > text.length
          ? textarea.value.slice(0, -5)
          : text;
    } else if (random == 5) {
      textarea.value = text;
    } else if (random == 9) {
      textarea.value = textarea.value.slice(0, -1) + randomCharacter();
    }
  });

  let saveButton = document.querySelector("#save-button");
  saveButton.addEventListener("click", () => {
    let random = Math.floor(Math.random() * 4);
    if (random == 0) {
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const errors = [
            "Erreur système: 0x000000",
            "Votre PC a rencontré un problème",
            "DLL Manquant",
            "Registre corrompu",
          ];
          const msg = errors[Math.floor(Math.random() * errors.length)];

          // Use the unified error style from core.js (via parent)
          if (typeof parent.showError === "function") {
            parent.showError("Erreur système", msg);
          }
        }, 50 * i);
      }
    } else {
      text = textarea.value;
    }
  });
  let counter = 0;
  let deleteButton = document.querySelector("#delete-button");
  deleteButton.addEventListener("click", () => {
    counter++;
    if (counter == 5) {
      if (typeof parent.showError === "function") {
        parent.showError(
          "Error",
          "🤡 Pourquoi tu continues de cliquer ? Tu vois bien que le bouton marche pas non ?"
        );
      }
      counter = 0;
    }
  });
});
