import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { SearchModal } from "@/components/search/SearchModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TelegramLogin, TelegramUser } from "@/components/comments/TelegramLogin";
import { TELEGRAM_BOT_USERNAME } from "@/lib/telegram";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Browse", path: "/browse" },
  { label: "DMCA", path: "/dmca" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginWidgetKey, setLoginWidgetKey] = useState(0);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const secretSequence = useRef<string[]>([]);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const restoreSession = () => {
      const stored = localStorage.getItem("tg_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("tg_user");
        }
      }
    };

    restoreSession();
  }, []);

  const handleAuth = useCallback((authUser: TelegramUser) => {
    setUser(authUser);
    setLoginOpen(false);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("tg_user");
    document.cookie =
      "tg_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setUser(null);
  };

  useEffect(() => {
    if (loginOpen) {
      setLoginWidgetKey((key) => key + 1);
    }
  }, [loginOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      const key = e.key.toLowerCase();
      if (key.length === 1 && /[a-z]/.test(key)) {
        secretSequence.current.push(key);
        if (secretSequence.current.length > 5) {
          secretSequence.current = secretSequence.current.slice(-5);
        }

        if (secretSequence.current.join("") === "admin") {
          navigate("/admin");
          secretSequence.current = [];
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const userLabel = user
    ? user.telegram_username
      ? `@${user.telegram_username}`
      : user.telegram_name
    : null;

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="BnToon" className="h-8 w-auto" />
              <span className="text-lg font-semibold">BnToon</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={
                    isActive(link.path)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {userLabel}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex gap-2"
                  onClick={() => setLoginOpen(true)}
                >
                  <LogIn className="h-4 w-4" />
                  Login with Telegram
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-4">
              <nav className="flex flex-col gap-3 text-sm font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={
                      isActive(link.path)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2">
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {userLabel}
                    </span>
                    <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setLoginOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4" />
                    Login with Telegram
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login to BnToon</DialogTitle>
            <DialogDescription>
              Connect your Telegram account to comment on comics and chapters.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            {loginOpen && (
              <TelegramLogin
                key={loginWidgetKey}
                botName={TELEGRAM_BOT_USERNAME}
                onAuth={handleAuth}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
