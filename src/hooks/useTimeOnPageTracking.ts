import { useEffect, useRef } from 'react';
import { Voiture } from '../types/voiture';
import { supabaseDailyDigestUrl, supabaseAnonKey } from '../lib/supabase';
import { sendTelegramNotification, THREAD_IDS } from '../lib/telegram';
import { getOrCreateVisitorId, getVisitorShortId, getVisitorSourceLabel } from '../lib/visitor';
import {
  MSG_TIME_ON_PAGE,
  TIME_BUCKET_REBOND_THRESHOLD,
  TIME_BUCKET_QUICK_READ_THRESHOLD,
} from '../constants/notificationMessages';

export function useTimeOnPageTracking(car: Voiture | null) {
  const carRef = useRef<Voiture | null>(null);

  useEffect(() => {
    carRef.current = car;
  }, [car]);

  useEffect(() => {
    const startTime = Date.now();
    return () => {
      try {
        const carData = carRef.current;
        if (!carData) return;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const bucket =
          elapsed < TIME_BUCKET_REBOND_THRESHOLD
            ? 'rebond'
            : elapsed < TIME_BUCKET_QUICK_READ_THRESHOLD
            ? 'lu_rapidement'
            : 'lu_en_detail';
        const voitureLabel = `${carData.year} ${carData.make} ${carData.model} ${carData.licencePlateLetters}`;
        const voitureUrl = `${window.location.origin}/voitures/${carData.id}`;
        const payload = JSON.stringify({
          event_type: 'time_on_page',
          voiture_id: carData.id,
          voiture_label: voitureLabel,
          voiture_url: voitureUrl,
          search_query: bucket,
          visitor_id: getOrCreateVisitorId(),
          visitor_short_id: getVisitorShortId(),
        });
        const endpoint = `${supabaseDailyDigestUrl}/rest/v1/click_events`;
        const headers: Record<string, string> = {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        };
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(endpoint, blob);
        }
        fetch(endpoint, { method: 'POST', headers, body: payload, keepalive: true }).catch(() => {});
        if (bucket !== 'rebond') {
          getVisitorSourceLabel(getOrCreateVisitorId()).then((sourceLabel) => {
            const source = sourceLabel || 'accès direct';
            sendTelegramNotification(
              MSG_TIME_ON_PAGE(voitureLabel, bucket, elapsed, voitureUrl, getVisitorShortId(), source),
              String(THREAD_IDS.timeSpentOnCarOfCarPage)
            ).catch(() => {});
          }).catch(() => {});
        }
      } catch {
        // silently ignored
      }
    };
  }, []);
}
