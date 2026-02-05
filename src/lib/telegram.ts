const DEFAULT_TELEGRAM_BOT_USERNAME = "BnToonCommentsBot";

function normalizeBotUsername(value?: string): string {
  if (!value) return DEFAULT_TELEGRAM_BOT_USERNAME;
  return value.trim().replace(/^@/, "") || DEFAULT_TELEGRAM_BOT_USERNAME;
}

export const TELEGRAM_BOT_USERNAME = normalizeBotUsername(
  import.meta.env.VITE_TELEGRAM_BOT_NAME
);
