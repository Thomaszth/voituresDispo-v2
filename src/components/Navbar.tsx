import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendTelegramNotification, THREAD_IDS } from '../lib/telegram';

interface NavbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}

export default function Navbar({ searchValue, onSearchChange, onSearchSubmit }: NavbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileSearchOpen(false);
    onSearchChange('');
  }, [location.pathname]);

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const lastTrackedQuery = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = searchValue.trim();
    if (trimmed.length < 3) return;

    const timer = setTimeout(async () => {
      const current = searchValue.trim();
      if (current.length < 3) return;
      if (current === lastTrackedQuery.current) return;

      lastTrackedQuery.current = current;

      try {
        await supabase.from('click_events').insert({
          event_type: 'search_query',
          search_query: current,
          voiture_id: null,
          voiture_label: null,
          voiture_url: null,
        });

        await sendTelegramNotification(
          `\u{1F50D} Nouvelle recherche : *${current}*`,
          String(THREAD_IDS.searchQueries)
        );
      } catch {
        // silently ignored
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    lastTrackedQuery.current = null;
  }, [location.pathname]);

  const handleClear = () => {
    onSearchChange('');
  };

  const handleCloseMobileSearch = () => {
    setMobileSearchOpen(false);
    onSearchChange('');
  };

  const handleSearchSubmit = (value: string) => {
    if (value.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(value);
      } else {
        navigate(`/catalogue?q=${encodeURIComponent(value.trim())}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const isCatalogue = location.pathname === '/catalogue' || location.pathname === '/';
      if (!isCatalogue && searchValue.trim()) {
        handleSearchSubmit(searchValue);
      }
    }
  };

  const handleBlur = () => {
    const isCatalogue = location.pathname === '/catalogue' || location.pathname === '/';
    if (!isCatalogue && searchValue.trim()) {
      handleSearchSubmit(searchValue);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-vd-black border-b border-white/5">
      <div className="w-full px-5 md:px-8 lg:px-12">
        <div className="flex items-center h-16 gap-4">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="font-cormorant text-white font-light text-xl tracking-wide transition-opacity duration-200 hover:opacity-75"
            >
              Voitures Dispo
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center px-6">
            <div className="w-full max-w-md relative">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-vd-caption pointer-events-none"
              />
              <input
                ref={desktopInputRef}
                type="text"
                placeholder="Rechercher par marque, modèle, année, carburant..."
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="w-full pl-10 pr-9 py-2 rounded-full font-jost font-light text-sm text-white placeholder-vd-caption focus:outline-none transition-colors duration-200 bg-vd-dark-2"
              />
              {searchValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white transition-opacity duration-200 hover:opacity-70"
                  aria-label="Effacer la recherche"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 ml-auto flex items-center gap-4">
            <NavLink
              to="/palmares"
              className={({ isActive }) =>
                `font-jost uppercase font-light no-underline transition-all duration-200 ${
                  isActive ? 'opacity-100 underline' : 'opacity-70 hover:opacity-100 hover:underline'
                }`
              }
              style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#FFFFFF', textDecorationColor: 'currentColor' }}
            >
              NOS VENTES
            </NavLink>
            <button
              className="md:hidden flex items-center justify-center text-white transition-opacity duration-200 hover:opacity-70"
              onClick={() => setMobileSearchOpen(prev => !prev)}
              aria-label="Ouvrir la recherche"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out border-t border-white/5 ${
          mobileSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-3 flex items-center gap-3 bg-vd-dark-2">
          <Search size={14} className="text-vd-caption flex-shrink-0" />
          <input
            ref={mobileInputRef}
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Rechercher par marque, modèle, année..."
            className="flex-1 bg-transparent font-jost font-light text-white placeholder-vd-caption focus:outline-none text-sm"
          />
          <button
            onClick={handleCloseMobileSearch}
            className="flex-shrink-0 text-white transition-opacity duration-200 hover:opacity-70"
            aria-label="Fermer la recherche"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
