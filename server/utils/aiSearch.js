import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getSemanticSearchTerms = async (query) => {
  try {
    const prompt = `Convert the following e-commerce search query into 3 broad, single-word categories or synonyms that would help find the product if the exact name isn't a match. For example: "red shoes for running" -> ["sneakers", "footwear", "running"]. "iphone" -> ["smartphone", "apple", "mobile"]. Query: "${query}"\nReturn ONLY a comma-separated list of the 3 words.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text.split(',').map(s => s.trim().toLowerCase());
  } catch (error) {
    console.error('Semantic search expansion failed:', error);
    return [];
  }
};
