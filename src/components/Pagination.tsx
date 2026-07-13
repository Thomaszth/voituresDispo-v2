import {
  PAGINATION_PREV,
  PAGINATION_NEXT,
  pageLabel,
  seenMessage,
} from '../constants/catalogueLabels';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const shown = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
      <p className="font-jost font-light text-center text-xs text-vd-caption mb-4 mt-12">
        {seenMessage(shown, totalItems)}
      </p>
      <div className="flex items-center justify-center pt-12 md:pt-16 gap-8">
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="font-jost uppercase font-light text-[11px] tracking-[0.18em] transition-opacity duration-200 hover:opacity-50 text-vd-text"
          >
            {PAGINATION_PREV}
          </button>
        )}
        <span className="font-jost font-light text-[12px] text-vd-meta">
          {pageLabel(currentPage, totalPages)}
        </span>
        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="font-jost uppercase font-light text-[11px] tracking-[0.18em] transition-opacity duration-200 hover:opacity-50 text-vd-text"
          >
            {PAGINATION_NEXT}
          </button>
        )}
      </div>
    </>
  );
}
