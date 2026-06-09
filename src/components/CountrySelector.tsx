import { useState, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { COUNTRIES, getFlagUrl, Country } from '../data/countries';

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCountry = useMemo(
    () => COUNTRIES.find(c => c.code === value) || COUNTRIES[0],
    [value]
  );

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const query = search.toLowerCase();
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.callingCode.includes(query)
    );
  }, [search]);

  const handleSelect = (country: Country) => {
    onChange(country.code);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 flex-shrink-0 border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 px-1 text-sm min-w-country-selector focus:outline-none focus:border-vd-text transition-colors duration-200"
        >
          <img
            src={getFlagUrl(selectedCountry.code, 20)}
            alt={selectedCountry.name}
            className="w-5 h-auto rounded-sm"
          />
          <span>{selectedCountry.callingCode}</span>
          <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-72 max-h-80 overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center border-b border-vd-border px-3 py-2">
          <Search className="w-4 h-4 mr-2 opacity-50" />
          <input
            type="text"
            placeholder="Rechercher un pays..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent font-jost font-light text-vd-text text-sm focus:outline-none"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto max-h-64">
          {filteredCountries.length === 0 ? (
            <div className="px-3 py-6 text-center text-vd-meta font-jost font-light text-sm">
              Aucun pays trouvé
            </div>
          ) : (
            filteredCountries.map(country => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  country.code === value ? 'bg-gray-50' : ''
                }`}
              >
                <img
                  src={getFlagUrl(country.code, 20)}
                  alt={country.name}
                  className="w-5 h-auto rounded-sm flex-shrink-0"
                />
                <span className="font-jost font-light text-vd-text flex-1 text-sm">
                  {country.callingCode}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
