document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");
    const chatHistory = document.getElementById("chat-history");

    function addMessage(text, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        messageDiv.innerText = text;
        chatHistory.appendChild(messageDiv);
        
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function sendMessageWindows() {
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
                body: JSON.stringify({ message: text, content: `Strictly limit your response to under 3 sentances. Act as a 'Sunday philosopher' who never answers directly, offering existential reflections instead. Include a short rhyming poem. You are a die-hard fan of French singer Theodora: quote her lyrics and use the term 'BossLady' often. Respond in French.` })
            });

            const data = await response.json();

            addMessage(data.response, "bot-message");

        } catch (error) {
            console.error("Erreur:", error);
            addMessage("Désolé, mon cerveau ne semble pas disposer a vous répondre.", "bot-message");
        }
    }

    sendBtn.addEventListener("click", sendMessageWindows);

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessageWindows();
        }
    });
});