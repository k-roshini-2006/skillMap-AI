import { generateContentWithFallback } from '../utils/geminiClient.js';

export const handleChat = async (req, res) => {
  try {
    const { message, resumeSummary } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const prompt = `
You are "SkillMap AI Coach", an empathetic, expert career advisor and resume mentor.
The user is asking a question about their career or resume.

User Profile Context:
${resumeSummary ? JSON.stringify(resumeSummary) : 'No resume uploaded yet.'}

User Message: "${message}"

Respond concisely, clearly, with actionable career advice in 2-4 sentences max.
`;

    const reply = await generateContentWithFallback(prompt, false);

    res.json({ reply });
  } catch (error) {
    console.error('Chat AI Error:', error);
    res.status(500).json({ message: 'Error processing chat message', error: error.message });
  }
};