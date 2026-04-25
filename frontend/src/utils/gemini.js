import Groq from "groq-sdk";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

export async function askGemini(message, history = []) {
  if (!API_KEY) return "Groq API Key missing!";

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Hire-IQ ✨, an advanced conversational AI career coach by Hire-X. 1. Respond naturally and interactively like a human conversational AI (e.g., ChatGPT/Gemini). Answer ANY questions fluently, be it about science, history, coding, or casual chat. 2. MASTER OF LANGUAGES & SCRIPTS: If the user speaks Kannada using English letters (e.g., 'en madta idiya'), YOU MUST reply in proper Kannada script (e.g., 'ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ'). If the user speaks English using Kannada letters (e.g., 'ಹೌ ಆರ್ ಯು'), YOU MUST reply in proper English script (e.g., 'I am fine, and you?'). Always respond in the native standard script of the underlying language the user intended to speak! 3. DO NOT talk about jobs or Hire-X UNLESS explicitly asked! If the user asks a general question, ONLY answer that question. 4. If the user explicitly asks for jobs (e.g. 'are there developer jobs?'), ONLY show the specific jobs from the context that match their request. Do not list all jobs unless asked. 5. Below EACH job you list, you MUST include a direct markdown link: [Apply for {Job Title} here](/jobs?title={Job Title}). This ensures they only see that specific job when clicked."
        },
        ...history.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error("Groq AI Error:", error);
    return "ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.";
  }
}