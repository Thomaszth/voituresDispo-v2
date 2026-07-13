import { supabase } from '../lib/supabase';
import { sendTelegramNotification } from '../lib/telegram';
import { getOrCreateVisitorId, getVisitorShortId, getVisitorSourceLabel, getVisitorHistory } from '../lib/visitor';

type CountFilterField = 'voiture_id' | 'voiture_label';

interface TrackAndNotifyOptions {
  eventType: string;
  voitureId: string | null;
  voitureLabel: string;
  voitureUrl: string;
  threadId: string;
  countFilterField?: CountFilterField;
  buildMessage: (count: number | string, visitorShortId: string, source: string) => string;
  withHistory?: boolean;
}

export function useCarPageTracking() {
  const trackAndNotify = async ({
    eventType,
    voitureId,
    voitureLabel,
    voitureUrl,
    threadId,
    countFilterField = 'voiture_id',
    buildMessage,
    withHistory = false,
  }: TrackAndNotifyOptions): Promise<void> => {
    await supabase.from('click_events').insert({
      event_type: eventType,
      voiture_id: voitureId,
      voiture_label: voitureLabel,
      voiture_url: voitureUrl,
      search_query: null,
      visitor_id: getOrCreateVisitorId(),
      visitor_short_id: getVisitorShortId(),
    });

    const countQuery = supabase
      .from('click_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', eventType)
      .eq(countFilterField, countFilterField === 'voiture_id' ? voitureId : voitureLabel);

    const visitorId = getOrCreateVisitorId();

    if (withHistory) {
      const [{ count }, history] = await Promise.all([
        countQuery,
        getVisitorHistory(visitorId),
      ]);
      const historyBlock = history ? `\n${history}` : '';
      await sendTelegramNotification(
        buildMessage(count ?? '?', getVisitorShortId(), historyBlock),
        threadId
      );
    } else {
      const [{ count }, sourceLabel] = await Promise.all([
        countQuery,
        getVisitorSourceLabel(visitorId),
      ]);
      const source = sourceLabel || 'accès direct';
      await sendTelegramNotification(
        buildMessage(count ?? '?', getVisitorShortId(), source),
        threadId
      );
    }
  };

  return { trackAndNotify };
}
