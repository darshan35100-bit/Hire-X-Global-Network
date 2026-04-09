require('dotenv').config({ path: './backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const chat = model.startChat({
        systemInstruction: {
            role: "system",
            parts: [{ text: "You are a test assistant." }]
        }
    });
    const result = await chat.sendMessage("hello");
    console.log(result.response.text());
  } catch (error) {
    console.error("ERROR CAUGHT:");
    console.error(error);
  }
}
test();
