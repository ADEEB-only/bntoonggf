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
 
   // Check for existing session on mount
   useEffect(() => {

    const restoreSession = async () => {
       try {

        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.authenticated && data?.user) {
            setUser(data.user);
            localStorage.setItem("tg_user", JSON.stringify(data.user));
            return;
          }
        }
       } catch {
        // Fall back to localStorage below
       }

      const stored = localStorage.getItem("tg_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("tg_user");
        }
      }
    };

    void restoreSession();
   }, []);
 
   const handleAuth = useCallback((authUser: TelegramUser) => {
     setUser(authUser);
     setLoginOpen(false);
   }, []);
 
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore logout network failures and clear client state regardless
    }

     localStorage.removeItem("tg_user");
    document.cookie = "tg_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
     setUser(null);
   };
 
  useEffect(() => {
    if (loginOpen) {
      setLoginWidgetKey((key) => key + 1);
    }
  }, [loginOpen]);

   // Listen for keyboard shortcuts
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       // Search shortcut: Cmd/Ctrl + K
       if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
         e.preventDefault();
         setSearchOpen(true);
         return;
       }
 
       // Secret admin access: Type "admin" quickly (within 2 seconds)
       const key = e.key.toLowerCase();
       if (key.length === 1 && /[a-z]/.test(key)) {
         secretSequence.current.push(key);
         
         // Keep only the last 5 characters
         if (secretSequence.current.length > 5) {
           secretSequence.current = secretSequence.current.slice(-5);
         }
         
         // Check if "admin" was typed
         if (secretSequence.current.join("") === "admin") {
           navigate("/admin");
           secretSequence.current = [];
         }
export function Header() {
                     }}
                   >
                     <LogIn className="h-4 w-4" />
                     Login with Telegram
                   </Button>
                 )}
               </div>
             </nav>
           )}
         </div>
       </header>
 
       {/* Search Modal */}
       <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
 
       {/* Login Modal */}
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
