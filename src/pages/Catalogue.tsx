import { useMemo, useState, useEffect, useRef } from 'react';
import { VehicleRequestForm } from '../components/VehicleRequestForm';
import { CarCard } from '../components/CarCard';
import { Pagination } from '../components/Pagination';
import { matchesCar } from '../utils/matchesCar';
import { useVoitures } from '../hooks/useVoitures';
import { useScrollHint } from '../hooks/useScrollHint';
import { dbToVoiture } from '../types/voitureDB';
import { ChevronDown } from 'lucide-react';
import { trackSession } from '../lib/session';
import { THREAD_IDS } from '../lib/telegram';
import { useCarPageTracking } from '../hooks/useCarPageTracking';
import { MSG_CATALOGUE_VISIT, MSG_PAGINATION_DEPTH } from '../constants/notificationMessages';
import { LABEL_LOADING } from '../constants/carDetailLabels';
import {
  CATALOGUE_HERO_TITLE,
  CATALOGUE_HERO_SUBTITLE,
  resultsCountMessage,
} from '../constants/catalogueLabels';

const CARS_PER_PAGE = 8;

interface CatalogueProps {
  searchValue: string;
  onClearSearch: () => void;
}

export default function Catalogue({ searchValue, onClearSearch }: CatalogueProps) {
  const { voitures: rawVoitures, loading } = useVoitures();
  const { trackAndNotify } = useCarPageTracking();
  const { showScrollHint, hintVisible } = useScrollHint();
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Page visit tracking — fire-and-forget
    (async () => {
      try {
        await trackSession();
        await trackAndNotify({
          eventType: 'page_visit',
          voitureId: null,
          voitureLabel: 'catalogue',
          voitureUrl: window.location.href,
          threadId: String(THREAD_IDS.catalogPageVisit),
          countFilterField: 'voiture_label',
          buildMessage: (count, visitorShortId, source) =>
            MSG_CATALOGUE_VISIT(count, window.location.href, visitorShortId, source),
        });
      } catch {
        // silently ignored
      }
    })();
  }, [trackAndNotify]);

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
    if (page > 1) {
      const searchQuery = searchValue.trim() || null;
      (async () => {
        try {
          await trackAndNotify({
            eventType: 'pagination_depth',
            voitureId: null,
            voitureLabel: 'page_' + page,
            voitureUrl: window.location.href,
            threadId: String(THREAD_IDS.paginationDepthTracking),
            countFilterField: 'voiture_label',
            buildMessage: (count, visitorShortId, source) =>
              MSG_PAGINATION_DEPTH(page, count, searchQuery, visitorShortId, source),
          });
        } catch {
          // silently ignored
        }
      })();
    }
  };

  const hasQuery = searchValue.trim().length > 0;
  const hasResults = filteredCars.length > 0;

  return (
    <main className="min-h-screen bg-white">
      <section className="w-full bg-vd-black pt-20 pb-10 md:py-32 lg:py-40 relative">
        <div className="px-5 md:px-8 lg:px-12 flex flex-col items-center text-center">
          <h1 className="font-cormorant font-light text-white mt-6 text-[clamp(48px,10vw,80px)] tracking-wide anim-init animate-fade-up">
              {CATALOGUE_HERO_TITLE}

          </h1>
          <div className="h-px bg-gray-600 mt-8 w-15 anim-init animate-fade-up" />
          <p className="font-jost font-light text-vd-caption mt-8 max-w-lg text-sm tracking-wide anim-init animate-fade-up">
             {CATALOGUE_HERO_SUBTITLE}  
          </p>
        </div>
        {!showScrollHint && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-400"
            style={{ opacity: hintVisible ? 1 : 0 }}
          >
            <ChevronDown
              size={20}
              className="scroll-hint-bob text-vd-caption"
            />
          </div>
        )}
      </section>

      {hasQuery && hasResults && (
        <div className="px-5 md:px-8 lg:px-12 pt-8 pb-0">
          <p className="font-jost font-light text-vd-caption text-xs">
            {resultsCountMessage(filteredCars.length)}
          </p>
        </div>
      )}

      {loading ? (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12">
          <p className="font-jost font-light text-vd-caption text-sm">{LABEL_LOADING}</p>
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCars.length}
              itemsPerPage={CARS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      )}
    </main>
  );
}
