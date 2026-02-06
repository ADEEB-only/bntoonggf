 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/examples/nextjs-telegram-login/app/api/auth/session/route.ts b/examples/nextjs-telegram-login/app/api/auth/session/route.ts
new file mode 100644
index 0000000000000000000000000000000000000000..a42bde21059804adac781d4b50f104c8d00c70ec
--- /dev/null
+++ b/examples/nextjs-telegram-login/app/api/auth/session/route.ts
@@ -0,0 +1,23 @@
+import { NextResponse } from "next/server";
+import { getSessionCookieName, parseSessionCookie } from "@/lib/telegram-auth";
+
+export async function GET(req: Request) {
+  const secret = process.env.TELEGRAM_SESSION_SECRET;
+  if (!secret) {
+    return NextResponse.json({ error: "Server configuration is incomplete" }, { status: 500 });
+  }
+
+  const cookieHeader = req.headers.get("cookie") || "";
+  const sessionCookie = cookieHeader
+    .split(";")
+    .map((part) => part.trim())
+    .find((part) => part.startsWith(`${getSessionCookieName()}=`))
+    ?.slice(`${getSessionCookieName()}=`.length);
+
+  const user = parseSessionCookie(sessionCookie, secret);
+  if (!user) {
+    return NextResponse.json({ authenticated: false }, { status: 401 });
+  }
+
+  return NextResponse.json({ authenticated: true, user });
+}
 
EOF
)
