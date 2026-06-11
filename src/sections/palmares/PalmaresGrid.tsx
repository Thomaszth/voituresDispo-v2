import { useState } from 'react';
import { usePalmares } from '../../hooks/usePalmares';
import { dbToPalmares, Palmares } from '../../types/palmares';
import { formatPrice } from '../../utils/formatPrice';

function SaleCard({ entry }: { entry: Palmares }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-white border border-vd-border rounded-sm overflow-hidden transition-shadow duration-300 hover:shadow-subtle-md">
      <div
        className="relative w-full overflow-hidden flex items-center justify-center h-[180px] md:h-[200px] lg:h-[220px]"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        {!imgError ? (
          <img
            src={entry.photo}
            alt={entry.carName}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            className="font-jost uppercase text-center"
            style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#444' }}
          >
            AUCUNE PHOTO
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0" style={{ background: 'rgba(0,0,0,0.72)' }}>
          <p className="font-jost uppercase text-white text-center" style={{ fontSize: '9px', letterSpacing: '0.18em', padding: '6px 12px' }}>
            VENDU EN {entry.daysToSell} JOUR(S)
          </p>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-cormorant font-light text-vd-text leading-tight" style={{ fontSize: '21px' }}>
          {entry.carName}
        </h3>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="font-jost uppercase" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#9A9A9A' }}>
              PRIX DEMANDÉ
            </p>
            <p className="font-jost font-light mt-1" style={{ fontSize: '13px', color: '#6B6B6B' }}>
              {formatPrice(entry.ownerAskingPrice)}
            </p>
          </div>
          <div>
            <p className="font-jost uppercase" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#9A9A9A' }}>
              PRIX DE VENTE
            </p>
            <p className="font-jost font-semibold mt-1" style={{ fontSize: '14px', color: '#0A0A0A' }}>
              {formatPrice(entry.finalSalePrice)}
            </p>
          </div>
        </div>

        <div className="border-t border-vd-border my-4" />

        <p className="font-jost font-light italic" style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: '1.7' }}>
          {entry.comment}
        </p>
      </div>
    </div>
  );
}

export function PalmaresGrid() {
  const { palmares: rawPalmares, loading, error } = usePalmares();
  const items = rawPalmares.map(dbToPalmares);

  const textStyle = { fontSize: '14px', color: '#9A9A9A' };

  if (loading) {
    return (
      <section className="w-full bg-white py-14 md:py-20 px-6">
        <p className="font-jost font-light text-center" style={textStyle}>Chargement...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-white py-14 md:py-20 px-6">
        <p className="font-jost font-light text-center" style={textStyle}>Impossible de charger les données.</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="w-full bg-white py-14 md:py-20 px-6">
        <p className="font-jost font-light text-center" style={textStyle}>Aucune vente à afficher pour le moment.</p>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-14 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="font-jost uppercase text-center mb-8" style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}>
          LES VENTES
        </p>
        <div className="grid gap-5 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map(entry => (
            <SaleCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
