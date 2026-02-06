import { useEffect } from "react";

interface TelegramUser {
  telegram_id: number;
  telegram_username?: string;
  telegram_name?: string;
  photo_url?: string;
}

interface CommentSectionProps {
  seriesId: string;
  chapterId: string;
  tgUser: TelegramUser | null;
  onLogin: (user: TelegramUser) => void;
}

export const CommentSection = ({
  seriesId,
  chapterId,
  tgUser,
  onLogin,
}: CommentSectionProps) => {
  // Restore Telegram user if page refreshed
  useEffect(() => {
    if (!tgUser) {
      const stored = localStorage.getItem("tg_user");
      if (stored) {
        try {
          onLogin(JSON.parse(stored));
        } catch {
          localStorage.removeItem("tg_user");
        }
      }
    }
  }, [tgUser, onLogin]);

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>

      {!tgUser ? (
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Login with Telegram to comment</p>

          {/* Telegram Login Widget */}
          <script
            async
            src="https://telegram.org/js/telegram-widget.js?22"
            data-telegram-login="BnToonAccBot"
            data-size="large"
            data-userpic="true"
            data-request-access="write"
            data-onauth="onTelegramAuth"
          ></script>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-3">
            {tgUser.photo_url && (
              <img
                src={tgUser.photo_url}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm">
              Logged in as{" "}
              <strong>{tgUser.telegram_name || tgUser.telegram_username}</strong>
            </span>
          </div>

          {/* Placeholder for comments list */}
          <div className="text-sm text-muted-foreground mb-4">
            No comments yet.
          </div>

          {/* Comment input */}
          <textarea
            className="w-full border rounded-md p-2 text-sm"
            placeholder="Write a comment..."
          />

          <button
            className="mt-2 px-4 py-1 rounded-md bg-primary text-primary-foreground text-sm"
            onClick={() => {
              alert("Hook this to backend later");
            }}
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
};
