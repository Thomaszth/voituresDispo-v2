import { useCallback, useEffect } from 'react';
import { PalmaresHero } from '../sections/palmares/PalmaresHero';
import { PalmaresGrid } from '../sections/palmares/PalmaresGrid';
import { PalmaresCta } from '../sections/palmares/PalmaresCta';
import { PalmaresCommission } from '../sections/palmares/PalmaresCommission';
import { PalmaresForm } from '../sections/palmares/PalmaresForm';
import { PalmaresFinalStrip } from '../sections/palmares/PalmaresFinalStrip';
import { trackSession } from '../lib/session';
import { supabase } from '../lib/supabase';
import { sendTelegramNotification, THREAD_IDS } from '../lib/telegram';

export default function Palmares() {
  useEffect(() => {
    // Page visit tracking — fire-and-forget
    (async () => {
      try {
        await trackSession();
        const label = 'palmares';
        await supabase.from('click_events').insert({
          event_type: 'page_visit',
          voiture_id: null,
          voiture_label: label,
          voiture_url: window.location.href,
          search_query: null,
        });
        const { count } = await supabase
          .from('click_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'page_visit')
          .eq('voiture_label', label);
        await sendTelegramNotification(
          `\u{1F4C4} Visite palmarès #${count ?? '?'}\n${window.location.href}`,
          String(THREAD_IDS.palmaresPageVisit)
        );
      } catch {
        // silently ignored
      }
    })();
  }, []);

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
