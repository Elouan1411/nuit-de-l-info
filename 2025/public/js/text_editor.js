document.addEventListener("DOMContentLoaded", function () {
  let text = localStorage.getItem("text") || "";

  var editor = CodeMirror.fromTextArea(document.getElementById("note-input"), {
    lineNumbers: true,
    mode: "javascript",
    theme: "monokai",
  });

  editor.setValue(text);

  function save() {
    const currentText = editor.getValue();
    localStorage.setItem("text", currentText);
  }

  function suppr() {
    editor.setValue("");
    localStorage.setItem("text", "");
    console.log("Données supprimées");
  }

  const saveButton = document.querySelector("#save-button");
  saveButton.addEventListener("click", save);

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      save();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      console.log("sucession détectée");
      e.preventDefault();
      suppr();
    }
  });

  const deleteButton = document.querySelector("#delete-button");
  deleteButton.addEventListener("click", suppr);
});
