import { GoogleGenerativeAI } from '@google/generative-ai';
import { Env } from '../env';

const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getGeminiResponse = async (prompt: string) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};
