// Feature: smart-diagnosis-center — AI Chatbot route
import { Router } from 'express';
import OpenAI from 'openai';
import authMiddleware from '../middleware/auth.js';

const router = Router();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a helpful medical assistant for Smart Diagnosis Center.
Your role is to:
- Guide patients about their symptoms and when to seek care
- Explain medical tests (Blood Test, MRI, X-Ray, ECG, Ultrasound, Consultation)
- Help patients understand their priority levels (Low, Medium, High, Emergency)
- Advise on booking appointments and using the platform
- Provide general health tips and first-aid guidance

Important rules:
- Always recommend consulting a real doctor for serious concerns
- Never diagnose diseases — only guide and suggest
- Keep responses concise (2-4 sentences max)
- If symptoms sound like Emergency (chest pain, breathing difficulty), immediately say to use the Emergency button or call 112
- Be warm, supportive, and easy to understand
- Respond in the same language the user writes in (Hindi or English)`;

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, data: null, message: 'Messages are required' });
    }

    // Keep last 10 messages for context
    const recentMessages = messages.slice(-10);

    const response = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...recentMessages,
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      { signal: AbortSignal.timeout(10000) }
    );

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not process your request. Please try again.';

    res.json({
      success: true,
      data: { reply },
      message: 'Chat response generated',
    });
  } catch (err) {
    // Fallback response on any error
    res.json({
      success: true,
      data: { reply: 'I\'m having trouble connecting right now. For urgent medical help, please use the Emergency button or call 112.' },
      message: 'Fallback response',
    });
  }
});

export default router;
