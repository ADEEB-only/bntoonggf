 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/examples/nextjs-telegram-login/app/api/auth/logout/route.ts b/examples/nextjs-telegram-login/app/api/auth/logout/route.ts
new file mode 100644
index 0000000000000000000000000000000000000000..41e7559fb7c0d3a3651cd2b7169931c71abd5f16
--- /dev/null
+++ b/examples/nextjs-telegram-login/app/api/auth/logout/route.ts
@@ -0,0 +1,16 @@
+import { NextResponse } from "next/server";
+import { getSessionCookieName } from "@/lib/telegram-auth";
+
+export async function POST() {
+  const res = NextResponse.json({ success: true });
+  res.cookies.set({
+    name: getSessionCookieName(),
+    value: "",
+    httpOnly: true,
+    secure: process.env.NODE_ENV === "production",
+    sameSite: "lax",
+    path: "/",
+    maxAge: 0,
+  });
+  return res;
+}
 
EOF
)
