export function PalmaresCta() {
  const scrollToForm = () => {
    const el = document.getElementById('confier-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-20 px-6 text-center" style={{ backgroundColor: '#0A0A0A' }}>
      <p className="font-jost uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}>
        VOUS VENDEZ ?
      </p>
      <h2 className="font-cormorant font-light text-white mt-4" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
        Votre véhicule mérite le même résultat.
      </h2>
      <p className="font-jost font-light mt-4" style={{ fontSize: '14px', color: '#9A9A9A' }}>
        Confiez-nous la vente. Nous nous occupons de tout — vous ne payez qu'à la vente conclue.
      </p>
      <button
        onClick={scrollToForm}
        className="mt-9 font-jost uppercase font-light transition-all duration-200"
        style={{
          background: '#FFFFFF',
          color: '#0A0A0A',
          letterSpacing: '0.15em',
          fontSize: '12px',
          padding: '16px 40px',
          borderRadius: '2px',
          border: 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#F5F5F5';
          e.currentTarget.style.letterSpacing = '0.17em';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.letterSpacing = '0.15em';
        }}
      >
        CONFIER MON VÉHICULE →
      </button>
    </section>
  );
}
