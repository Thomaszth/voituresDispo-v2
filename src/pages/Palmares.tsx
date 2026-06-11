import { useCallback } from 'react';
import { PalmaresHero } from '../sections/palmares/PalmaresHero';
import { PalmaresGrid } from '../sections/palmares/PalmaresGrid';
import { PalmaresCta } from '../sections/palmares/PalmaresCta';
import { PalmaresCommission } from '../sections/palmares/PalmaresCommission';
import { PalmaresForm } from '../sections/palmares/PalmaresForm';
import { PalmaresFinalStrip } from '../sections/palmares/PalmaresFinalStrip';

export default function Palmares() {
  const handleStepChange = useCallback((_step: number) => {
    // no-op — reserved for future scroll tracking
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <PalmaresHero />
      <PalmaresGrid />
      <PalmaresCta />
      <PalmaresCommission />
      <PalmaresForm onStepChange={handleStepChange} />
      <PalmaresFinalStrip />
    </main>
  );
}
