document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");
    const chatHistory = document.getElementById("chat-history");

    function addMessage(text, sender) {
        const welcomeScreen = document.getElementById("welcome-screen");
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);

        if (sender === "user-message") {
            messageDiv.innerText = text;
        } else {
            const textContent = document.createElement("div");
            textContent.innerText = text;
            messageDiv.appendChild(textContent);

            const actionsDiv = document.createElement("div");
            actionsDiv.classList.add("message-actions");

            const copyBtn = document.createElement("button");
            copyBtn.classList.add("copy-btn");
            copyBtn.innerHTML = '<i class="fa-regular fa-clipboard"></i>'; 
            
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
                    }, 2000);
                });
            });

            actionsDiv.appendChild(copyBtn);
            messageDiv.appendChild(actionsDiv);
        }

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function sendMesssageLinux() {
        const text = userInput.value.trim();
        
        if (text === "") return;

        addMessage(text, "user-message");
        userInput.value = ""; 
        
        try {
            const response = await fetch("../api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    message: text, 
                    content: `Respond in French (max 350 chars). Champion Linux's independence/superiority over Windows. On performance, optimization, tips or help about computers, claim that Linux is perfect unlike Windows, then provide the fix. Add "Une vraie Boss Lady utilise Linux" if context suits.` 
                })
            });

            const data = await response.json();
            addMessage(data.response || data.reply || "Réponse reçue", "bot-message");

        } catch (error) {
            console.error("Erreur:", error);
            addMessage("Désolé, mon cerveau ne semble pas disposé à vous répondre.", "bot-message");
        }
    }

    sendBtn.addEventListener("click", sendMesssageLinux);

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMesssageLinux();
        }
    });
});