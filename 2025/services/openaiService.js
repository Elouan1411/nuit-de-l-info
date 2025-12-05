const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getOpenAIResponse(userMessage, content) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                { 
                    role: "system", 
                    content: content
                },
                { 
                    role: "user", 
                    content: userMessage 
                }
            ],
            max_tokens: 150,
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error("Erreur OpenAI:", error);
        return "Désolé, mon cerveau numérique est hors ligne pour le moment (Erreur API).";
    }
}

module.exports = { getOpenAIResponse };