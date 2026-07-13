import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendTelegramNotification, THREAD_IDS } from '../lib/telegram';
import { useTypingPlaceholder } from '../hooks/useTypingPlaceholder';
import { getOrCreateVisitorId, getVisitorShortId, getVisitorSourceLabel } from '../lib/visitor';

const TYPING_PHRASES = [
  'Toyota Camry...',
  'V4 Automatique...',
  'Mercedes CLA250 2015...',
  'Rechercher par marque, modèle...',
];

interface NavbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}

export default function Navbar({ searchValue, onSearchChange, onSearchSubmit }: NavbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [hasActiveRecherches, setHasActiveRecherches] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const desktopActive = !searchValue && !desktopFocused;
  const mobileActive = mobileSearchOpen && !searchValue && !mobileFocused;

  const desktopTyping = useTypingPlaceholder({ phrases: TYPING_PHRASES, active: desktopActive });
  const mobileTyping = useTypingPlaceholder({ phrases: TYPING_PHRASES, active: mobileActive });

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
          visitor_id: getOrCreateVisitorId(),
          visitor_short_id: getVisitorShortId(),
        });

        const sourceLabel = await getVisitorSourceLabel(getOrCreateVisitorId());
        const source = sourceLabel || 'accès direct';

        await sendTelegramNotification(
          `\u{1F50D} Nouvelle recherche : *${current}*\n\u{1F464} ${getVisitorShortId()} · ${source}`,
          String(THREAD_IDS.searchQueries)
        );

        if (typeof fbq !== 'undefined') {
          fbq('track', 'Search', { search_string: current });
        }
      } catch {
        // silently ignored
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    lastTrackedQuery.current = null;
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      try {
        const { count, error } = await supabase
          .from('recherches')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        if (!error && count !== null && count > 0) {
          setHasActiveRecherches(true);
        }
      } catch {
        // silently ignored
      }
    })();
  }, []);

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

  const handleDesktopBlur = useCallback(() => {
    setDesktopFocused(false);
    const isCatalogue = location.pathname === '/catalogue' || location.pathname === '/';
    if (!isCatalogue && searchValue.trim()) {
      handleSearchSubmit(searchValue);
    }
    if (!searchValue) {
      desktopTyping.restart();
    }
  }, [location.pathname, searchValue, desktopTyping]);

  const handleMobileBlur = useCallback(() => {
    setMobileFocused(false);
    const isCatalogue = location.pathname === '/catalogue' || location.pathname === '/';
    if (!isCatalogue && searchValue.trim()) {
      handleSearchSubmit(searchValue);
    }
    if (!searchValue && mobileSearchOpen) {
      mobileTyping.restart();
    }
  }, [location.pathname, searchValue, mobileSearchOpen, mobileTyping]);

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
                placeholder={desktopActive ? desktopTyping.placeholder : ''}
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setDesktopFocused(true)}
                onBlur={handleDesktopBlur}
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
              to="/recherches"
              className={({ isActive }) =>
                `font-jost uppercase font-light no-underline transition-all duration-200 ${
                  isActive ? 'opacity-100 underline' : 'opacity-70 hover:opacity-100 hover:underline'
                }`
              }
              style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#FFFFFF', textDecorationColor: 'currentColor' }}
            >
              <span className="flex items-center">
                RECHERCHES
                {hasActiveRecherches && (
                  <span
                    className="ml-1"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      animation: 'pulse-dot 2s ease-in-out infinite',
                    }}
                  />
                )}
              </span>
            </NavLink>
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
            onFocus={() => setMobileFocused(true)}
            onBlur={handleMobileBlur}
            placeholder={mobileActive ? mobileTyping.placeholder : ''}
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
