import { useCallback, useEffect } from 'react';
import { PalmaresHero } from '../sections/palmares/PalmaresHero';
import { PalmaresGrid } from '../sections/palmares/PalmaresGrid';
import { PalmaresCta } from '../sections/palmares/PalmaresCta';
import { PalmaresCommission } from '../sections/palmares/PalmaresCommission';
import { PalmaresForm } from '../sections/palmares/PalmaresForm';
import { PalmaresFinalStrip } from '../sections/palmares/PalmaresFinalStrip';
import { trackSession } from '../lib/session';
import { THREAD_IDS } from '../lib/telegram';
import { useCarPageTracking } from '../hooks/useCarPageTracking';
import { MSG_PALMARES_VISIT } from '../constants/notificationMessages';
import { BackToCatalogueLink } from '../components/BackToCatalogueLink';

export default function Palmares() {
  const { trackAndNotify } = useCarPageTracking();

  useEffect(() => {
    // Page visit tracking — fire-and-forget
    (async () => {
      try {
        await trackSession();
        const label = 'palmares';
        await trackAndNotify({
          eventType: 'page_visit',
          voitureId: null,
          voitureLabel: label,
          voitureUrl: window.location.href,
          threadId: String(THREAD_IDS.palmaresPageVisit),
          countFilterField: 'voiture_label',
          buildMessage: (count, visitorShortId, source) =>
            MSG_PALMARES_VISIT(count, window.location.href, visitorShortId, source),
        });
      } catch {
        // silently ignored
      }
    })();
  }, [trackAndNotify]);

  const handleStepChange = useCallback((_step: number) => {
    // no-op — reserved for future scroll tracking
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-vd-black pt-8 pb-6 px-5 md:px-8 lg:px-12">
        <BackToCatalogueLink />
      </div>
      <PalmaresHero />
      <PalmaresGrid />
      <PalmaresCta />
      <PalmaresCommission />
      <PalmaresForm onStepChange={handleStepChange} />
      <PalmaresFinalStrip />
    </main>
  );
}
