import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { getCache, setCache } from '../utils/cache.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get AI product recommendations
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const cacheKey = `ai_recommendations_${userId}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    // Get user preferences
    const user = await User.findById(userId).select('preferences name');
    const preferredCategories = user.preferences?.categories || [];
    const viewedProductIds = user.preferences?.viewedProducts?.slice(-10) || [];

    // Get a sample of available products for context
    const allProducts = await Product.find({ stock: { $gt: 0 } })
      .select('name category price ratings tags brand description')
      .limit(50)
      .lean();

    if (allProducts.length === 0) {
      return res.status(200).json({ success: true, recommendations: [], message: 'No products available.' });
    }

    const productSummary = allProducts.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category,
      price: p.price,
      rating: p.ratings,
      brand: p.brand,
      tags: p.tags,
    }));

    const prompt = `
You are an AI shopping assistant for an e-commerce store called Ecom..

User profile:
- Name: ${user.name}
- Preferred categories: ${preferredCategories.length > 0 ? preferredCategories.join(', ') : 'None specified'}
- Recently viewed product IDs: ${viewedProductIds.join(', ') || 'None'}

Available products (JSON):
${JSON.stringify(productSummary, null, 2)}

Based on the user's preferences and browsing history, recommend the TOP 6 most relevant product IDs from the list above.
Return ONLY a valid JSON array of product ID strings, like: ["id1","id2","id3","id4","id5","id6"]
No explanation, no markdown, just the JSON array.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let recommendedIds = [];
    try {
      // Extract JSON array from response
      const match = text.match(/\[.*\]/s);
      if (match) recommendedIds = JSON.parse(match[0]);
    } catch {
      recommendedIds = allProducts.slice(0, 6).map((p) => p._id.toString());
    }

    const recommendations = await Product.find({
      _id: { $in: recommendedIds },
      stock: { $gt: 0 },
    }).select('name slug price discountPrice images ratings numOfReviews category brand');

    const response = { success: true, recommendations };
    setCache(cacheKey, response, 1800); // Cache for 30 minutes

    res.status(200).json(response);
  } catch (error) {
    // Graceful fallback: return popular products
    try {
      const fallback = await Product.find({ stock: { $gt: 0 } })
        .sort({ ratings: -1 })
        .limit(6)
        .select('name slug price discountPrice images ratings numOfReviews category brand');
      return res.status(200).json({ success: true, recommendations: fallback, fallback: true });
    } catch (fallbackError) {
      next(error);
    }
  }
};

// @desc    Get AI-powered search suggestions
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) return res.status(200).json({ success: true, suggestions: [] });

    const cacheKey = `search_suggestions_${query.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(5)
      .select('name slug category');

    const result = { success: true, suggestions: products };
    setCache(cacheKey, result, 300);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const chatSupport = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const systemPrompt = `You are a friendly and professional customer support agent for "Ecom.", a modern Indian e-commerce store.

Store Policies:
- Free shipping on orders over ₹500. Orders below ₹500 have a flat ₹30 delivery charge.
- 7-day hassle-free returns on all products.
- Payments accepted via UPI, debit/credit cards, and net banking.
- Orders can be cancelled within 24 hours of placing (before shipping).
- Customers can track their orders on the "My Orders" page after logging in.
- Customer support is available 24/7 via this chat.

Guidelines:
- Be warm, concise, and helpful.
- Keep responses under 4 short sentences.
- Do not mention AI or any AI platform.
- If you cannot answer, offer to escalate to the support team.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { maxOutputTokens: 200, temperature: 0.5 },
    });

    // Build history for the chat
    const formattedHistory = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Hello! I'm the Ecom. support team. How can I help you today?" }] },
    ];

    if (history && history.length > 1) {
      const chatHistory = history.slice(1, -1);
      chatHistory.forEach(msg => {
        formattedHistory.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      });
    }

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message.trim());
    const response = result.response.text();

    res.json({ success: true, response });
  } catch (error) {
    console.error('Chat Error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: 'Support chat is temporarily unavailable. Please try again shortly.',
    });
  }
};
