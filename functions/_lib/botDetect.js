// Case-insensitive substring matchers for OG/social scrapers and search bots.
// List taken from zampa-og-images-claude-code-prompt.md section C.
const BOT_SIGNATURES = [
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
];

export function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_SIGNATURES.some((sig) => ua.includes(sig));
}
