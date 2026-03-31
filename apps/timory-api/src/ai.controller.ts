import { Body, Controller, Header, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

interface HistoryItem {
	role: string;
	content: string;
}

/**
 * OpenAI Chat Completions orqali javob olish
 */
async function fetchOpenAIReply(message: string, history: HistoryItem[], apiKey: string): Promise<string> {
	const validHistory = history.filter((h) => h?.content?.trim());
	const messages = [
		...validHistory.map((h) => ({
			role: h.role === 'assistant' ? 'assistant' : 'user',
			content: String(h.content).trim(),
		})),
		{ role: 'user' as const, content: message.trim() },
	];

	const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
	const url = process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1/chat/completions';

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages,
			temperature: 0.7,
		}),
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		const errMsg = data?.error?.message || data?.error?.code || `OpenAI API: ${res.status}`;
		const isRateLimit = res.status === 429 || /quota|rate limit/i.test(String(errMsg));
		const e = new Error(errMsg) as Error & { statusCode?: number; retryAfter?: number };
		e.statusCode = res.status;
		if (isRateLimit) {
			const retryHeader = res.headers.get('Retry-After');
			e.retryAfter = retryHeader ? Number(retryHeader) || 30 : 30;
		}
		throw e;
	}

	const text: string = data?.choices?.[0]?.message?.content?.trim() || '';
	if (text) return text;
	throw new Error('OpenAI response was empty.');
}

/** Bepul kvota ko‘proq bo‘lishi mumkin bo‘lgan model birinchi */
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'] as const;

/** Gemini API orqali AI javob olish (model topilmasa keyingi model sinanadi) */
async function fetchGeminiReply(message: string, history: HistoryItem[], apiKey: string): Promise<string> {
	const validHistory = history.filter((h) => h?.content?.trim());
	const contents = [
		...validHistory.map((h) => ({
			role: h.role === 'user' ? 'user' : 'model',
			parts: [{ text: String(h.content).trim() }],
		})),
		{ role: 'user' as const, parts: [{ text: message.trim() }] },
	];

	const body = {
		contents,
		generationConfig: {
			temperature: 0.7,
			maxOutputTokens: 1024,
		},
	};

	let lastError: Error | null = null;
	for (const model of GEMINI_MODELS) {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			const errMsg = data?.error?.message || data?.error?.status || `Gemini API: ${res.status}`;
			const isModelNotFound = res.status === 404 || /not found|invalid model/i.test(String(errMsg));
			if (isModelNotFound) {
				lastError = new Error(errMsg);
				continue;
			}
			const isRateLimit = res.status === 429 || /retry in \d/i.test(String(errMsg)) || /quota|rate limit/i.test(String(errMsg));
			const e = new Error(errMsg) as Error & { statusCode?: number; retryAfter?: number };
			e.statusCode = res.status;
			if (isRateLimit) {
				const match = String(errMsg).match(/retry in (\d+(?:\.\d+)?)\s*s/i);
				e.retryAfter = match ? Math.ceil(Number(match[1])) : 30;
			}
			throw e;
		}

		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
		if (text) return text;
		const blockReason = data.candidates?.[0]?.finishReason || 'Javob generatsiya qilinmadi.';
		throw new Error(blockReason);
	}

	throw lastError || new Error('Gemini model topilmadi.');
}

export interface AIWatchRecommendItem {
	brand: string;
	model: string;
	price: string;
	reason: string;
	description: string;
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function buildPrompt(params: { gender: string; style: string; budget: string; color: string; thought: string }): string {
	const parts: string[] = [
		"You are a luxury watch expert. Based on the user's preferences, recommend exactly 3 watches.",
		'Reply ONLY with a valid JSON array, no other text. Each object must have: brand, model, price (e.g. $5,000), reason (short), description (40-50 words explaining why this watch is recommended).',
		'The description field for each watch MUST be between 40 and 50 words.',
		'Example format: [{"brand":"Rolex","model":"Submariner","price":"$8,500","reason":"...","description":"..."}]',
	];
	const prefs: string[] = [];
	if (params.gender) prefs.push(`Gender: ${params.gender}`);
	if (params.style) prefs.push(`Style: ${params.style}`);
	if (params.budget) {
		if (params.budget === 'under-5k') {
			prefs.push('Budget: under $5,000 (maximum $5,000).');
			parts.push('Every recommended watch must have a price less than or equal to $5,000. Do NOT recommend watches above this budget.');
		} else if (params.budget === '5k-10k') {
			prefs.push('Budget: between $5,000 and $10,000.');
			parts.push('Every recommended watch must have a price between $5,000 and $10,000 (inclusive). Do NOT recommend cheaper or more expensive watches.');
		} else if (params.budget === '10k-plus') {
			prefs.push('Budget: above $10,000.');
			parts.push('Every recommended watch must have a price strictly greater than $10,000. Do NOT recommend cheaper watches.');
		} else {
			prefs.push(`Budget: ${params.budget}`);
		}
	}
	if (params.color) prefs.push(`Color: ${params.color}`);
	if (params.thought?.trim()) prefs.push(`Additional: ${params.thought.trim()}`);
	if (prefs.length) parts.push('User preferences:\n' + prefs.join('\n'));
	parts.push('Return only the JSON array.');
	return parts.join('\n\n');
}

function parseJsonFromText(text: string): { watches: AIWatchRecommendItem[]; parseError?: string } {
	const trimmed = text.trim();
	let jsonStr = trimmed;
	const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeBlock) jsonStr = codeBlock[1].trim();
	const arrayMatch = jsonStr.match(/\[\s*[\s\S]*\s*\]/);
	if (arrayMatch) jsonStr = arrayMatch[0];
	try {
		const parsed = JSON.parse(jsonStr) as unknown;
		if (!Array.isArray(parsed)) return { watches: [] };
		const watches = parsed
			.filter((item) => item && typeof item === 'object' && (item as any).brand && (item as any).model)
			.map((item: Record<string, unknown>) => ({
				brand: String(item.brand ?? ''),
				model: String(item.model ?? ''),
				price: String(item.price ?? ''),
				reason: String(item.reason ?? ''),
				description: String(item.description ?? ''),
			}));
		return { watches };
	} catch (e) {
		return { watches: [], parseError: e instanceof Error ? e.message : 'JSON parse error' };
	}
}

async function fetchOpenAIRecommendations(
	params: { gender: string; style: string; budget: string; color: string; thought: string },
	apiKey: string,
): Promise<AIWatchRecommendItem[]> {
	const prompt = buildPrompt(params);
	const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
	const url = process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1/chat/completions';

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: 'system',
					content:
						'You are a luxury watch expert. Always respond ONLY with a valid JSON array of exactly 3 watch objects, no extra text. The description field for each watch MUST be between 40 and 50 words.',
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			temperature: 0.6,
		}),
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		const errMsg = data?.error?.message || data?.error?.code || `OpenAI API: ${res.status}`;
		throw new Error(errMsg);
	}

	const text: string = data?.choices?.[0]?.message?.content?.trim() || '';
	if (!text) {
		throw new Error('OpenAI response was empty.');
	}

	const { watches, parseError } = parseJsonFromText(text);
	if (parseError) {
		throw new Error(`OpenAI response parse error: ${parseError}`);
	}
	return watches;
}

@Controller()
export class AiController {
	@Post('ai-chat')
	@HttpCode(200)
	@Header('Content-Type', 'application/json')
	async aiChat(@Body() body: { message?: string; history?: HistoryItem[] }, @Res() res: Response) {
		try {
			const { message, history = [] } = body || {};

			if (!message || typeof message !== 'string') {
				return res.status(400).json({ error: 'Message is required.' });
			}

			const openaiKey = process.env.OPENAI_API_KEY;
			const geminiKey = process.env.GEMINI_API_KEY;

			if (!openaiKey && !geminiKey) {
				return res.status(200).json({
					reply:
						'AI service is not configured. Set OPENAI_API_KEY in .env.local. (Optional: set GEMINI_API_KEY for Google Gemini fallback).',
				});
			}

			const reply = openaiKey
				? await fetchOpenAIReply(message, history, openaiKey)
				: await fetchGeminiReply(message, history, geminiKey as string);

			return res.status(200).json({ reply });
		} catch (err: unknown) {
			const e = err as Error & { statusCode?: number; retryAfter?: number };
			const msg = e?.message || 'An error occurred with the AI service.';
			const isRateLimit = e?.statusCode === 429 || e?.retryAfter;
			const retrySec = e?.retryAfter ?? 30;
			console.error('[api/ai-chat]', msg, err);

			if (isRateLimit) {
				res.setHeader('Retry-After', String(retrySec));
				return res.status(429).json({
					error: `Rate limit. Try again in ${retrySec} seconds.`,
					reply: null,
					retryAfter: retrySec,
				});
			}

			return res.status(500).json({ error: msg, reply: null });
		}
	}

	@Post('ai-watch-recommend')
	@HttpCode(200)
	@Header('Content-Type', 'application/json')
	async aiWatchRecommend(
		@Body() body: { gender?: string; style?: string; budget?: string; color?: string; thought?: string },
		@Req() req: Request,
		@Res() res: Response,
	) {
		void req;
		try {
			const { gender = '', style = '', budget = '', color = '', thought = '' } = (body || {}) as Record<string, string>;

			const openaiKey = process.env.OPENAI_API_KEY;
			const geminiKey = process.env.GEMINI_API_KEY;

			if (!openaiKey && !geminiKey) {
				return res.status(200).json({
					watches: [],
					error:
						'AI service is not configured. Set OPENAI_API_KEY in .env.local. (Optional: set GEMINI_API_KEY for Google Gemini fallback).',
				});
			}

			if (openaiKey) {
				const watches = await fetchOpenAIRecommendations({ gender, style, budget, color, thought }, openaiKey);
				return res.status(200).json({ watches });
			}

			// Fallback: Gemini (old behavior)
			const apiKey = geminiKey as string;
			const prompt = buildPrompt({ gender, style, budget, color, thought });
			const url = `${GEMINI_URL}?key=${apiKey}`;
			const resGemini = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: [{ role: 'user', parts: [{ text: prompt }] }],
					generationConfig: {
						temperature: 0.6,
						maxOutputTokens: 1024,
					},
				}),
			});

			const data = await resGemini.json().catch(() => ({}));
			const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

			if (!text) {
				return res.status(200).json({
					watches: [],
					error: data.candidates?.[0]?.finishReason || 'AI did not respond.',
				});
			}

			const { watches, parseError } = parseJsonFromText(text);
			if (parseError) {
				console.warn('[api/ai-watch-recommend] Gemini response parse issue:', parseError, 'Raw length:', text.length);
				return res.status(200).json({
					watches: [],
					error: 'AI response format is invalid. Please try again.',
				});
			}
			return res.status(200).json({ watches });
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Server error';
			console.error('[api/ai-watch-recommend]', msg, err);
			return res.status(500).json({ watches: [], error: msg });
		}
	}
}

