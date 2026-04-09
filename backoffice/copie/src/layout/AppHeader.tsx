import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { apiGet } from "../lib/api";

type SearchResult = {
  orders: Array<{ id: string; status?: string; customer?: { name?: string; email?: string } }>;
  products: Array<{ id: string | number; name?: string; brand?: string; sku?: string; status?: string }>;
  messages: Array<{ id: string | number; name?: string; email?: string; message?: string }>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  returned: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function SearchDropdown({ results, query, onClose }: { results: SearchResult | null; query: string; onClose: () => void }) {
  const navigate = useNavigate();

  if (!query || query.length < 2) return null;
  if (!results) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-4 text-sm text-gray-400 text-center">
        Recherche…
      </div>
    );
  }

  const total = results.orders.length + results.products.length + results.messages.length;
  if (total === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-4 text-sm text-gray-400 text-center">
        Aucun résultat pour « {query} »
      </div>
    );
  }

  function go(path: string) {
    onClose();
    navigate(path);
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden max-h-[420px] overflow-y-auto">
      {results.orders.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-gray-400">Commandes</p>
          {results.orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => go("/orders")}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-left"
            >
              <span className="font-mono text-xs text-gray-500">#{o.id}</span>
              <span className="flex-1 text-sm text-gray-800 dark:text-white/90 truncate">
                {o.customer?.name ?? o.customer?.email ?? "—"}
              </span>
              {o.status && (
                <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {o.status}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {results.products.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-gray-400 border-t border-gray-100 dark:border-gray-800">Produits</p>
          {results.products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go("/catalog")}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-left"
            >
              <span className="text-sm text-gray-800 dark:text-white/90 truncate flex-1">{p.name ?? "—"}</span>
              {p.brand && <span className="text-xs text-gray-400">{p.brand}</span>}
              {p.sku && <span className="font-mono text-[10px] text-gray-400">{p.sku}</span>}
            </button>
          ))}
        </div>
      )}

      {results.messages.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-gray-400 border-t border-gray-100 dark:border-gray-800">Messages</p>
          {results.messages.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => go("/messages")}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-left"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">{m.name ?? "—"}</span>
              <span className="text-xs text-gray-400 truncate flex-1">{m.message?.slice(0, 60) ?? ""}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  // ⌘K focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
        setResults(null);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Click outside → close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setSearching(false); return; }
    setSearching(true);
    try {
      const res = await apiGet(`/admin/search?q=${encodeURIComponent(q)}`);
      setResults(res?.data ?? { orders: [], products: [], messages: [] });
    } catch {
      setResults({ orders: [], products: [], messages: [] });
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    setSearchOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val || val.length < 2) { setResults(null); return; }
    setResults(null); // show "Recherche…"
    debounceRef.current = setTimeout(() => doSearch(val), 320);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    setResults(null);
  }

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar toggle */}
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden">
            <img className="dark:hidden" src="./images/logo/logo.svg" alt="Logo" />
            <img className="hidden dark:block" src="./images/logo/logo-dark.svg" alt="Logo" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setApplicationMenuOpen(!isApplicationMenuOpen)}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z" fill="currentColor" />
            </svg>
          </button>

          {/* Search bar — desktop */}
          <div className="hidden lg:block relative flex-1 max-w-[480px]" ref={searchRef}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {searching ? (
                  <svg className="animate-spin text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : (
                  <svg className="fill-gray-400" width="16" height="16" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" />
                  </svg>
                )}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInput(e.target.value)}
                onFocus={() => query.length >= 2 && setSearchOpen(true)}
                placeholder="Rechercher commandes, produits, messages…"
                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-11 pr-14 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query ? (
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="flex items-center justify-center h-5 w-5 rounded text-gray-400 hover:text-gray-600"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                ) : (
                  <span className="rounded border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs text-gray-400 dark:border-gray-800 dark:bg-white/[0.03]">
                    ⌘ K
                  </span>
                )}
              </div>
            </div>
            {searchOpen && (
              <SearchDropdown results={results} query={query} onClose={closeSearch} />
            )}
          </div>
        </div>

        {/* Right side */}
        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
