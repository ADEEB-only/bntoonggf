"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TelegramLoginWidget?: {
      onAuth: (user: Record<string, unknown>) => void;
    };
  }
}

interface Props {
  botUsername: string;
  onSuccess?: (user: unknown) => void;
}

export function TelegramLoginWidget({ botUsername, onSuccess }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    window.TelegramLoginWidget = {
      onAuth: async (user) => {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(user),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          console.error("Telegram auth failed", error);
          return;
        }

        const data = await response.json();
        onSuccess?.(data.user);
      },
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername.replace(/^@/, ""));
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "TelegramLoginWidget.onAuth(user)");

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [botUsername, onSuccess]);

  return <div ref={containerRef} />;
}
