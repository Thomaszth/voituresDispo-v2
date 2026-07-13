const SERVICE_CARDS = [
  {
    step: '01',
    title: 'PHOTOS PROFESSIONNELLES',
    body: "Nous prenons en charge la séance photo de votre véhicule. Des visuels soignés qui attirent les acheteurs sérieux.",
  },
  {
    step: '02',
    title: 'PUBLICITÉ MULTICANAL',
    body: "Votre véhicule est diffusé sur Facebook, Instagram et WhatsApp — en publications organiques et en annonces payantes.",
  },
  {
    step: '03',
    title: 'QUALIFICATION DES ACHETEURS',
    body: "Nous filtrons les contacts entrants. Seuls les acheteurs sérieux et qualifiés accèdent à votre véhicule.",
  },
  {
    step: '04',
    title: 'SUIVI RÉGULIER',
    body: "Vous recevez des mises à jour régulières sur les demandes, les visites et l'avancement de la vente.",
  },
];

export function PalmaresCommission() {
  return (
    <section className="w-full bg-white py-14 md:py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* PART A — COMMISSION BLOCK */}
        <p
          className="font-jost uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}
        >
          NOS HONORAIRES
        </p>
        <h2
          className="font-cormorant font-light text-vd-text"
          style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', marginTop: '16px' }}
        >
          Une commission simple et transparente
        </h2>
        <p
          className="font-jost font-light mx-auto"
          style={{
            fontSize: '15px',
            color: '#6B6B6B',
            lineHeight: '1.9',
            marginTop: '20px',
            maxWidth: '600px',
          }}
        >
          Nous prélevons 5% du prix de vente final de votre véhicule.
          Notre commission minimale est de 100 000 FCFA — ce qui signifie
          que pour un véhicule vendu à 1 500 000 FCFA, nous prenons
          100 000 FCFA et non 75 000 FCFA.
        </p>

        <div
          className="mx-auto"
          style={{ width: '60px', height: '1px', background: '#E0E0E0', margin: '32px auto' }}
        />

        <p
          className="font-cormorant font-light italic"
          style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: '#9A9A9A' }}
        >
          Vous ne payez qu'après la vente. Aucun frais en avance.
        </p>

        {/* PART B — SERVICE CARDS GRID */}
        <p
          className="font-jost uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A', marginTop: '64px' }}
        >
          CE QUE NOUS FAISONS POUR VOUS
        </p>
        <h2
          className="font-cormorant font-light text-vd-text"
          style={{ fontSize: 'clamp(24px, 3vw, 38px)', marginTop: '16px', marginBottom: '40px' }}
        >
          Un service complet, de la mise en ligne à la vente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 text-left">
          {SERVICE_CARDS.map((card) => (
            <div
              key={card.step}
              className="transition-shadow duration-200 ease-out hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
              style={{
                background: '#F5F5F5',
                border: '1px solid #E0E0E0',
                borderRadius: '2px',
                padding: '28px 24px',
              }}
            >
              <p
                className="font-cormorant font-light"
                style={{ fontSize: '32px', color: '#E0E0E0', lineHeight: '1' }}
              >
                {card.step}
              </p>
              <p
                className="font-jost uppercase"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  fontWeight: 400,
                  color: '#0A0A0A',
                  marginTop: '16px',
                }}
              >
                {card.title}
              </p>
              <p
                className="font-jost font-light"
                style={{
                  fontSize: '13px',
                  color: '#6B6B6B',
                  lineHeight: '1.8',
                  marginTop: '10px',
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
