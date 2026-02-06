import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TelegramLogin, TelegramUser } from "@/components/comments/TelegramLogin";
import { TELEGRAM_BOT_USERNAME } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { CommentList } from "@/components/comments/CommentList";

interface CommentSectionProps {
  seriesId: string;
  chapterId?: string;
}

export const CommentSection = ({ seriesId, chapterId }: CommentSectionProps) => {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const canPost = Boolean(tgUser && content.trim());

  // Restore Telegram user if page refreshed
  useEffect(() => {
    if (tgUser) return;
    const stored = localStorage.getItem("tg_user");
    if (stored) {
      try {
        setTgUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("tg_user");
      }
    }
  }, [tgUser]);

  const handleAuth = useCallback((user: TelegramUser) => {
    setTgUser(user);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canPost || !supabaseUrl) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            seriesId,
            chapterId: chapterId || null,
            content: content.trim(),
          }),
        }
      );

      if (response.ok) {
        setContent("");
        setRefreshKey((prev) => prev + 1);
        toast({ title: "Comment posted!" });
      } else {
        const error = await response.json();
        toast({
          title: "Failed to post comment",
          description: error.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [canPost, chapterId, content, seriesId, supabaseUrl, toast]);

  const isAuthConfigured = useMemo(
    () => Boolean(TELEGRAM_BOT_USERNAME && supabaseUrl),
    [supabaseUrl]
  );

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>

      {!tgUser ? (
        <div className="text-sm text-muted-foreground space-y-4">
          <p>Login with Telegram to comment</p>
          {isAuthConfigured ? (
            <TelegramLogin
              botName={TELEGRAM_BOT_USERNAME}
              onAuth={handleAuth}
            />
          ) : (
            <p className="text-sm text-destructive">
              Telegram login is unavailable. Check VITE_TELEGRAM_BOT_NAME and
              VITE_SUPABASE_URL configuration.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            {tgUser.photo_url && (
              <img
                src={tgUser.photo_url}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>
              Logged in as{" "}
              <strong>{tgUser.telegram_name || tgUser.telegram_username}</strong>
            </span>
          </div>

          <CommentList
            seriesId={seriesId}
            chapterId={chapterId}
            refreshKey={refreshKey}
            currentUser={tgUser}
          />

          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!canPost || isSubmitting || !supabaseUrl}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
