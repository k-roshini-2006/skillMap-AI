import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Stable Google Gemini Models
const FALLBACK_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp'
];

export const generateContentWithFallback = async (prompt, jsonMode = false) => {
  let lastError = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`Sending resume data to Gemini model: ${modelName}...`);
      
      const config = {};
      if (jsonMode) {
        config.responseMimeType = "application/json";
      }

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: config
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`✅ Success via model: ${modelName}`);
        return text;
      }
    } catch (err) {
      console.warn(`Model ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini fallback models failed.');
};