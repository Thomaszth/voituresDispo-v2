import { supabase } from './supabase';

const SESSION_KEY = 'vd_session_tracked';

export async function trackSession(): Promise<void> {
  if (sessionStorage.getItem(SESSION_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  const referrer = document.referrer || null;
  const landing_page = window.location.pathname;

  try {
    await supabase.from('sessions').insert({
      utm_source,
      utm_medium,
      utm_campaign,
      referrer,
      landing_page,
    });
  } catch {
    // silently ignored
  }

  sessionStorage.setItem(SESSION_KEY, '1');
}
