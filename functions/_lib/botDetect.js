// Case-insensitive substring matchers for OG/social scrapers and search bots.
// List taken from zampa-og-images-claude-code-prompt.md section C.
//
// Matching here routes the request to the server-rendered, INDEXABLE response
// (renderBotResponse: OG/Twitter meta + JSON-LD, no `noindex`) instead of the
// human shell (which is `noindex`). So this list doubles as the allow-list of
// crawlers we want to read our structured data.
const BOT_SIGNATURES = [
  // OG/social scrapers + traditional search engines
  'facebookexternalhit',
  'whatsapp',
  'twitterbot',
  'telegrambot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'pinterest',
  'vkshare',
  'applebot',
  'embedly',
  'redditbot',
  'snapchat',
  'instagram',
  'googlebot',
  'bingbot',
  'duckduckbot',
  'yandexbot',

  // AI / answer-engine crawlers (GEO). Added so the JSON-LD from /o and /r
  // reaches the generative engines that cite content (ChatGPT, Claude,
  // Perplexity, Copilot, Gemini) instead of landing on the noindex shell.
  // These are substrings of the documented user-agents.
  'gptbot', // OpenAI training crawler
  'oai-searchbot', // ChatGPT search index
  'chatgpt-user', // ChatGPT on-demand fetch
  'claudebot', // Anthropic crawler
  'anthropic-ai', // Anthropic (legacy/alt)
  'claude-web', // Claude on-demand fetch
  'perplexitybot', // Perplexity index
  'perplexity-user', // Perplexity on-demand fetch
  'ccbot', // Common Crawl (feeds many LLMs)
  'bytespider', // ByteDance / Doubao
  'meta-externalagent', // Meta AI
  'mistralai', // Mistral (MistralAI-User / -crawler)
  'youbot', // You.com answer engine
];

export function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_SIGNATURES.some((sig) => ua.includes(sig));
}
