 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/examples/nextjs-telegram-login/app/login/page.tsx b/examples/nextjs-telegram-login/app/login/page.tsx
new file mode 100644
index 0000000000000000000000000000000000000000..e2e3d5502ae2762c076bcde3b895e2bf33361618
--- /dev/null
+++ b/examples/nextjs-telegram-login/app/login/page.tsx
@@ -0,0 +1,57 @@
+"use client";
+
+import { useEffect, useState } from "react";
+import { TelegramLoginWidget } from "@/components/TelegramLoginWidget";
+
+interface TelegramUser {
+  telegram_id: number;
+  telegram_username?: string;
+  telegram_name: string;
+  photo_url?: string;
+}
+
+export default function LoginPage() {
+  const [user, setUser] = useState<TelegramUser | null>(null);
+  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";
+
+  useEffect(() => {
+    fetch("/api/auth/session", { credentials: "include" })
+      .then(async (res) => {
+        if (!res.ok) return null;
+        return res.json();
+      })
+      .then((data) => {
+        if (data?.authenticated) setUser(data.user);
+      })
+      .catch(() => null);
+  }, []);
+
+  const logout = async () => {
+    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
+    setUser(null);
+  };
+
+  return (
+    <main style={{ maxWidth: 540, margin: "3rem auto", fontFamily: "sans-serif" }}>
+      <h1>Telegram Login</h1>
+
+      {!botUsername && (
+        <p style={{ color: "crimson" }}>
+          Missing NEXT_PUBLIC_TELEGRAM_BOT_USERNAME. Telegram widget cannot render properly.
+        </p>
+      )}
+
+      {user ? (
+        <>
+          <p>Logged in as <strong>{user.telegram_name}</strong>.</p>
+          <button onClick={logout}>Logout</button>
+        </>
+      ) : (
+        <TelegramLoginWidget
+          botUsername={botUsername}
+          onSuccess={(authedUser) => setUser(authedUser as TelegramUser)}
+        />
+      )}
+    </main>
+  );
+}
 
EOF
)
