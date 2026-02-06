import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Make Telegram callback global
(window as any).onTelegramAuth = (user: any) => {
  const tgUser = {
    telegram_id: user.id,
    telegram_username: user.username,
    telegram_name: user.first_name,
    photo_url: user.photo_url,
  };

  localStorage.setItem("tg_user", JSON.stringify(tgUser));
  window.location.reload();
};

createRoot(document.getElementById("root")!).render(<App />);
