const TELEGRAM_USERNAME_REGEX = /^[a-zA-Z0-9_]{5,32}$/;

function normalizeBotUsername(value?: string): string | null {
  if (!value) return null;
  const normalized = value.trim().replace(/^@/, "");
  return normalized || null;
}

const configuredBotUsername = normalizeBotUsername(
  import.meta.env.VITE_TELEGRAM_BOT_NAME
);

export const TELEGRAM_BOT_USERNAME = configuredBotUsername;

export const TELEGRAM_BOT_CONFIG = {
  configured: Boolean(configuredBotUsername),
  username: configuredBotUsername,
  validFormat: configuredBotUsername
    ? TELEGRAM_USERNAME_REGEX.test(configuredBotUsername)
    : false,
};
