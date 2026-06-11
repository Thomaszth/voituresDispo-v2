const COMMISSION_TIERS = [
  { range: '1M – 2 999 999 FCFA', fee: '100 000 FCFA' },
  { range: '3M – 4 999 999 FCFA', fee: '150 000 FCFA' },
  { range: '5M – 7 999 999 FCFA', fee: '200 000 FCFA' },
  { range: '8M – 9 999 999 FCFA', fee: '250 000 FCFA' },
  { range: '10M – 12 999 999 FCFA', fee: '300 000 FCFA' },
  { range: '13M – 14 999 999 FCFA', fee: '350 000 FCFA' },
  { range: '15M – 17 999 999 FCFA', fee: '400 000 FCFA' },
  { range: '18M – 19 999 999 FCFA', fee: '450 000 FCFA' },
  { range: '20M – 24 999 999 FCFA', fee: '500 000 FCFA' },
  { range: '25M – 29 999 999 FCFA', fee: '600 000 FCFA' },
  { range: '30M – 34 999 999 FCFA', fee: '700 000 FCFA' },
  { range: '35M – 39 999 999 FCFA', fee: '800 000 FCFA' },
  { range: '40M – 44 999 999 FCFA', fee: '900 000 FCFA' },
  { range: '45M – 49 999 999 FCFA', fee: '1 000 000 FCFA' },
];

export function PalmaresCommission() {
  return (
    <section className="w-full bg-white py-14 md:py-20 px-6">
      <div className="max-w-xl mx-auto">
        <p className="font-jost uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}>
          TRANSPARENCE
        </p>
        <h2 className="font-cormorant font-light text-vd-text mt-4" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
          Ce que ça vous coûte
        </h2>
        <p className="font-jost font-light mt-4" style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: '1.8' }}>
          Nos frais sont fixes, transparents, et prélevés uniquement après la vente. Aucun frais en avance.
        </p>

        <div className="border-t border-vd-border my-8" />

        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full" style={{ minWidth: '400px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                <th className="text-left font-jost uppercase pb-3 pr-4" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#9A9A9A' }}>
                  PRIX DE VENTE DU VÉHICULE
                </th>
                <th className="text-right font-jost uppercase pb-3" style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#9A9A9A' }}>
                  FRAIS VOITURES DISPO
                </th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_TIERS.map((tier, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E0E0E0', background: i % 2 === 0 ? '#FFFFFF' : '#F5F5F5' }}>
                  <td className="font-jost font-light py-3 pr-4" style={{ fontSize: '13px', color: '#0A0A0A' }}>
                    {tier.range}
                  </td>
                  <td className="font-jost font-light py-3 text-right" style={{ fontSize: '13px', color: '#0A0A0A' }}>
                    {tier.fee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-jost font-light italic text-center mt-6" style={{ fontSize: '13px', color: '#9A9A9A' }}>
          Vous ne payez que si nous vendons. C'est notre engagement.
        </p>
      </div>
    </section>
  );
}
