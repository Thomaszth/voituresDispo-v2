import { useEffect, useState, useRef } from 'react';
import { usePalmares } from '../../hooks/usePalmares';
import { dbToPalmares } from '../../types/palmares';
import { countUp } from '../../utils/countUp';
import { formatPrice } from '../../utils/formatPrice';

export function PalmaresHero() {
  const { palmares: rawPalmares, loading } = usePalmares();
  const [stats, setStats] = useState({ count: 0, totalValue: 0, avgDays: 0 });
  const [animatedStats, setAnimatedStats] = useState({ count: 0, totalValue: 0, avgDays: 0 });
  const [dataReady, setDataReady] = useState(false);
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(fn => fn());
    };
  }, []);

  useEffect(() => {
    if (!loading && rawPalmares.length > 0) {
      const items = rawPalmares.map(dbToPalmares);
      const count = items.length;
      const totalValue = items.reduce((sum, p) => sum + p.finalSalePrice, 0);
      const avgDays = Math.round(items.reduce((sum, p) => sum + p.daysToSell, 0) / count);
      setStats({ count, totalValue, avgDays });
      setDataReady(true);
    } else if (!loading && rawPalmares.length === 0) {
      setDataReady(true);
    }
  }, [loading, rawPalmares]);

  useEffect(() => {
    if (!dataReady) return;
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];

    if (stats.count === 0) return;

    const c1 = countUp(stats.count, 1200, 300, v => setAnimatedStats(prev => ({ ...prev, count: v })));
    const c2 = countUp(stats.totalValue, 1200, 300, v => setAnimatedStats(prev => ({ ...prev, totalValue: v })));
    const c3 = countUp(stats.avgDays, 1200, 300, v => setAnimatedStats(prev => ({ ...prev, avgDays: v })));
    cleanupRef.current = [c1, c2, c3];
  }, [dataReady, stats.count, stats.totalValue, stats.avgDays]);

  const statItems = [
    { value: dataReady && stats.count > 0 ? animatedStats.count : '—', label: 'VÉHICULES VENDUS' },
    { value: dataReady && stats.count > 0 ? formatPrice(animatedStats.totalValue) : '—', label: 'VALEUR TOTALE VENDUE' },
    { value: dataReady && stats.count > 0 ? `${animatedStats.avgDays} jours` : '—', label: 'DÉLAI MOYEN DE VENTE' },
  ];

  return (
    <section className="w-full py-[72px] md:py-[100px] px-6" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-3xl mx-auto text-center">
        
        <h1 className="font-cormorant font-light text-white mt-4 anim-init animate-fade-up animate-delay-100" style={{ fontSize: 'clamp(44px, 6vw, 76px)' }}>
          Nous vendons. Les chiffres le prouvent.
        </h1>
        <div className="mx-auto mt-7 anim-init animate-fade-up animate-delay-200" style={{ width: '60px', height: '1px', background: '#444' }} />
        <p className="font-jost font-light mt-7 anim-init animate-fade-up animate-delay-300" style={{ fontSize: '14px', color: '#9A9A9A', letterSpacing: '0.04em' }}>
          PALMARÈS / NOS VENTES
        </p>

        <div className="mt-14 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 anim-init animate-fade-up animate-delay-400">
          {statItems.map((stat, i) => (
            <div key={i} className="flex flex-col items-center w-full md:w-auto">
              {i > 0 && (
                <div className="hidden md:block" style={{ width: '1px', height: '56px', background: 'rgba(255,255,255,0.1)', margin: '0 32px' }} />
              )}
              {i > 0 && (
                <div className="md:hidden" style={{ width: '60px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              )}
              <span className="font-cormorant font-light text-white" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                {stat.value}
              </span>
              <span className="font-jost uppercase mt-2" style={{ fontSize: '10px', letterSpacing: '0.22em', color: '#9A9A9A' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
