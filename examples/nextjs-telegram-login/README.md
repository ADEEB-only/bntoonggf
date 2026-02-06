# Next.js Telegram Login (Official Widget)

This example implements Telegram Login with:

- **Official Telegram Login Widget** on the frontend
- **Server-side hash verification** in Next.js API routes
- **HttpOnly signed cookie session** handling (login/session/logout)

## Required environment variables

```bash
# Frontend bot username used by telegram-widget.js
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotUsername

# Backend bot token used to verify Telegram hash
TELEGRAM_BOT_TOKEN=123456:ABCDEF...

# Secret for signing app session cookies (min 32+ chars)
TELEGRAM_SESSION_SECRET=replace-with-long-random-secret
```

## Files

- `components/TelegramLoginWidget.tsx`
  - Injects `https://telegram.org/js/telegram-widget.js?22`
  - Uses `data-telegram-login` + `data-onauth`
  - Posts auth payload to `/api/auth/telegram`

- `app/api/auth/telegram/route.ts`
  - Validates required Telegram fields
  - Verifies hash with bot token
  - Rejects stale auth payloads
  - Sets signed HttpOnly session cookie

- `app/api/auth/session/route.ts`
  - Returns current authenticated user from session cookie

- `app/api/auth/logout/route.ts`
  - Clears the session cookie

- `lib/telegram-auth.ts`
  - Telegram hash verification logic
  - Session signing/verification helpers

## Important implementation notes

1. Widget username and backend bot token must belong to the **same bot**.
2. The Telegram Login Widget typically renders inline (not always a popup).
3. If you see `Username Invalid`, verify `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` first.
4. In production, configure secure cookies and HTTPS.
