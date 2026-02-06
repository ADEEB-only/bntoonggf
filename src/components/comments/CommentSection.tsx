 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/comments/CommentSection.tsx b/src/components/comments/CommentSection.tsx
index df385c3ab15e89cfc15a29787ff3b289654fbfbc..f24d47cb855e451f3b3e521431566701b0f3d24e 100644
--- a/src/components/comments/CommentSection.tsx
+++ b/src/components/comments/CommentSection.tsx
@@ -4,67 +4,97 @@
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";
  import { Loader2, Send, LogOut, MessageCircle } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 import { TELEGRAM_BOT_USERNAME } from "@/lib/telegram";
  
  interface CommentSectionProps {
    seriesId: string;
    chapterId?: string;
    botName?: string;
  }
  
  export function CommentSection({
    seriesId,
    chapterId,
   botName = TELEGRAM_BOT_USERNAME,
 }: CommentSectionProps) {
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { toast } = useToast();
  
    // Check for existing session
    useEffect(() => {
-     const stored = localStorage.getItem("tg_user");
-     if (stored) {
+     const restoreSession = async () => {
        try {
-         setUser(JSON.parse(stored));
+         const response = await fetch("/api/auth/session", {
+           credentials: "include",
+         });
+
+         if (response.ok) {
+           const data = await response.json();
+           if (data?.authenticated && data?.user) {
+             setUser(data.user);
+             localStorage.setItem("tg_user", JSON.stringify(data.user));
+             return;
+           }
+         }
        } catch {
-         localStorage.removeItem("tg_user");
+         // Fall back to localStorage below
        }
-     }
+
+       const stored = localStorage.getItem("tg_user");
+       if (stored) {
+         try {
+           setUser(JSON.parse(stored));
+         } catch {
+           localStorage.removeItem("tg_user");
+         }
+       }
+     };
+
+     void restoreSession();
    }, []);
  
    const handleAuth = useCallback((authUser: TelegramUser) => {
      setUser(authUser);
    }, []);
  
-   const handleLogout = () => {
+   const handleLogout = async () => {
+     try {
+       await fetch("/api/auth/logout", {
+         method: "POST",
+         credentials: "include",
+       });
+     } catch {
+       // ignore logout network failures and clear client state regardless
+     }
+
      localStorage.removeItem("tg_user");
-     document.cookie = "tg_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
+      document.cookie = "tg_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      setUser(null);
    };
  
    const handleSubmit = async () => {
      if (!content.trim() || !user) return;
  
      setIsSubmitting(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/comments`,
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
          setRefreshKey((k) => k + 1);
 
EOF
)
