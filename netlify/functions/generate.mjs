// Server-side proxy for the "Generate" page's Gemini call.
//
// The Gemini API key lives only here, as the secret environment variable
// GEMINI_API_KEY in Netlify. It must never be a VITE_ variable: anything
// prefixed VITE_ is baked into the public JavaScript bundle for everyone.

const MODEL = 'gemini-2.5-flash';
const MAX_PROMPT_CHARS = 8000;
const ALLOWED_ORIGINS = ['https://nightcap.me', 'https://www.nightcap.me'];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Browsers always send Origin on cross-site POSTs; refuse other websites using this as a free proxy.
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !origin.endsWith('.netlify.app')) {
    return json({ error: 'Forbidden' }, 403);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'Generator is not configured' }, 503);

  let prompt;
  try {
    ({ prompt } = await req.json());
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  if (typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > MAX_PROMPT_CHARS) {
    return json({ error: 'Invalid prompt' }, 400);
  }

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!upstream.ok) {
    // Never forward Google's error body; it can echo request details.
    return json({ error: 'The generator is unavailable right now' }, 502);
  }
  return json(await upstream.json());
};
