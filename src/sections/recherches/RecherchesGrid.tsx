import { useRecherches } from '../../hooks/useRecherches';
import { RechercheCard } from './RechercheCard';

export function RecherchesGrid() {
  const { recherches, loading, error } = useRecherches();

  const messageStyle: React.CSSProperties = {
    fontFamily: 'Jost, system-ui, sans-serif',
    fontWeight: 300,
    fontSize: '14px',
    color: '#9A9A9A',
  };

  return (
    <section className="w-full px-6 py-14 md:px-6 md:py-20" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <p className="text-center" style={messageStyle}>
            Chargement...
          </p>
        ) : error ? (
          <p className="text-center" style={messageStyle}>
            Impossible de charger les recherches.
          </p>
        ) : recherches.length === 0 ? (
          <p className="text-center" style={messageStyle}>
            Aucune recherche active pour le moment.
          </p>
        ) : (
          <>
            <p
              className="font-jost uppercase mb-8"
              style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}
            >
              RECHERCHES ACTIVES
            </p>
            <div
              className="grid gap-5 md:gap-6 lg:gap-8"
              style={{
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              }}
            >
              {recherches.map(recherche => (
                <RechercheCard key={recherche.id} recherche={recherche} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
