import { useEffect } from 'react';
import { RecherchesHero } from '../sections/recherches/RecherchesHero';
import { RecherchesGrid } from '../sections/recherches/RecherchesGrid';
import { RecherchesStrip } from '../sections/recherches/RecherchesStrip';
import { trackSession } from '../lib/session';
import { THREAD_IDS } from '../lib/telegram';
import { useCarPageTracking } from '../hooks/useCarPageTracking';
import { RECHERCHES_PAGE_LABEL, MSG_RECHERCHES_PAGE_VISIT } from '../constants/recherchesLabels';
import { BackToCatalogueLink } from '../components/BackToCatalogueLink';

export default function Recherches() {
  const { trackAndNotify } = useCarPageTracking();

  useEffect(() => {
    (async () => {
      try {
        await trackSession();
        await trackAndNotify({
          eventType: 'page_visit',
          voitureId: '',
          voitureLabel: RECHERCHES_PAGE_LABEL,
          voitureUrl: window.location.href,
          threadId: String(THREAD_IDS.recherchesPageVisit),
          countFilterField: 'voiture_label',
          buildMessage: (count, visitorShortId, source) =>
            MSG_RECHERCHES_PAGE_VISIT(count, window.location.href, visitorShortId, source),
        });
      } catch {
        // silently ignored
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-vd-black pt-8 pb-6 px-5 md:px-8 lg:px-12">
        <BackToCatalogueLink />
      </div>
      <RecherchesHero />
      <RecherchesGrid />
      <RecherchesStrip />
    </main>
  );
}
