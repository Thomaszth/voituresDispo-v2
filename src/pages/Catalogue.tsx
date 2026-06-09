import { useMemo, useState, useEffect, useRef } from 'react';
import { VehicleRequestForm } from '../components/VehicleRequestForm';
import { CarCard } from '../components/CarCard';
import { matchesCar } from '../utils/matchesCar';
import { useVoitures } from '../hooks/useVoitures';
import { dbToVoiture } from '../types/voitureDB';
import { ChevronDown } from 'lucide-react';

const CARS_PER_PAGE = 8;

interface CatalogueProps {
  searchValue: string;
  onClearSearch: () => void;
}

export default function Catalogue({ searchValue, onClearSearch }: CatalogueProps) {
  const { voitures: rawVoitures, loading } = useVoitures();
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      setHintVisible(true);
    }, 1200);
    return () => clearTimeout(fadeTimeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowScrollHint(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allCars = useMemo(() => rawVoitures.map(dbToVoiture), [rawVoitures]);

  const filteredCars = useMemo(() => {
    if (!searchValue.trim()) return allCars;
    return allCars.filter(car => matchesCar(car, searchValue));
  }, [allCars, searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * CARS_PER_PAGE;
    return filteredCars.slice(start, start + CARS_PER_PAGE);
  }, [filteredCars, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasQuery = searchValue.trim().length > 0;
  const hasResults = filteredCars.length > 0;

  return (
    <main className="min-h-screen bg-white">
      <section className="w-full bg-vd-black py-20 md:py-32 lg:py-40 relative">
        <div className="px-5 md:px-8 lg:px-12 flex flex-col items-center text-center">
          <p className="font-jost font-light text-vd-caption uppercase text-label tracking-widest anim-init animate-fade-up">
            Collection
          </p>
          <h1 className="font-cormorant font-light text-white mt-6 text-[clamp(48px,10vw,80px)] tracking-wide anim-init animate-fade-up">
            Notre Collection
          </h1>
          <div className="h-px bg-gray-600 mt-8 w-15 anim-init animate-fade-up" />
          <p className="font-jost font-light text-vd-caption mt-8 max-w-lg text-sm tracking-wide anim-init animate-fade-up">
            Garantie: un seul intermédiaire, nous.
          </p>
        </div>
        {!showScrollHint && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-400"
            style={{ opacity: hintVisible ? 1 : 0 }}
          >
            <ChevronDown
              size={20}
              className="scroll-hint-bob"
              style={{ color: '#9A9A9A' }}
            />
          </div>
        )}
      </section>

      {hasQuery && hasResults && (
        <div className="px-5 md:px-8 lg:px-12 pt-8 pb-0">
          <p className="font-jost font-light text-vd-caption text-xs">
            {filteredCars.length} véhicule{filteredCars.length > 1 ? 's' : ''} trouvé{filteredCars.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {loading ? (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12">
          <p className="font-jost font-light text-vd-caption text-sm">Chargement...</p>
        </section>
      ) : hasQuery && !hasResults ? (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12">
          <VehicleRequestForm searchQuery={searchValue} onReturnToCatalogue={onClearSearch} />
        </section>
      ) : (
        <section ref={gridRef} className="w-full bg-white px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
          <div className="grid gap-5 md:gap-6 lg:gap-8 grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))]">
            {paginatedCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center pt-12 md:pt-16 gap-8">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="font-jost uppercase font-light text-[11px] tracking-[0.18em] transition-opacity duration-200 hover:opacity-50"
                  style={{ color: '#0A0A0A' }}
                >
                  PRÉCÉDENT
                </button>
              )}
              <span
                className="font-jost font-light text-[12px]"
                style={{ color: '#6B6B6B' }}
              >
                Page {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="font-jost uppercase font-light text-[11px] tracking-[0.18em] transition-opacity duration-200 hover:opacity-50"
                  style={{ color: '#0A0A0A' }}
                >
                  SUIVANT
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
