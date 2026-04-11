import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function askGemini(message, history = []) {
  if (!API_KEY) {
    return "ಇದೊಂದು ಡೆಮೊ ರಿಸ್ಪಾನ್ಸ್. ಅಸಲಿ AI ಆಗಿ ಕೆಲಸ ಮಾಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ '.env' ಫೈಲ್‌ನಲ್ಲಿ 'VITE_GEMINI_API_KEY' ಸೇರಿಸಿ. (This is a demo response. Please add 'VITE_GEMINI_API_KEY' to your frontend .env file to enable real AI).";
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = "You are Hire-IQ ✨, an advanced, global AI assistant by Hire-X. You are as capable as ChatGPT or Gemini. You MUST answer ANY question the user asks, on ANY topic (coding, science, general knowledge, career, etc). You MUST understand, speak, and translate ALL languages fluently. If a user speaks Kannada, reply in Kannada. If Spanish, reply in Spanish. Be highly intelligent, very professional, incredibly helpful, and format answers beautifully.";

    const formattedHistory = [
      { role: 'user', parts: [{ text: `[SYSTEM INSTRUCTION]: ${systemPrompt}` }] },
      { role: 'model', parts: [{ text: "Understood. I will strictly act as Hire-IQ and follow all your instructions." }] },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    ];

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "ಕ್ಷಮಿಸಿ, ನಾನು ಪ್ರಸ್ತುತ ಪ್ರತಿಕ್ರಿಯಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ. (Sorry, I am unable to respond at this moment. Please ask your question again.)";
  }
}
