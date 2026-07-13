import { supabase } from './supabase';
import {
  VISITOR_SHORT_ID_PREFIX,
  VISITOR_SHORT_ID_FALLBACK,
  VISITOR_SOURCE_DIRECT,
  TABLE_VISITOR_PROFILES,
  TABLE_CLICK_EVENTS,
  VISITOR_HISTORY_LABELS,
} from '../constants/visitorLabels';
import { formatDate, formatDateTime } from '../utils/dateFormat';
import { eventToLine, dedupeHistoryLines } from './visitorHistoryFormatter';

const VISITOR_ID_KEY = 'vd_visitor_id';
const VISITOR_SHORT_ID_KEY = 'vd_visitor_short_id';

export function getOrCreateVisitorId(): string {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const uuid = crypto.randomUUID();
  const shortId = VISITOR_SHORT_ID_PREFIX + uuid.slice(0, 6);

  localStorage.setItem(VISITOR_ID_KEY, uuid);
  localStorage.setItem(VISITOR_SHORT_ID_KEY, shortId);

  return uuid;
}

export function getVisitorShortId(): string {
  return localStorage.getItem(VISITOR_SHORT_ID_KEY) ?? VISITOR_SHORT_ID_FALLBACK;
}

export async function syncVisitorProfile(): Promise<void> {
  try {
    const visitorId = getOrCreateVisitorId();
    const shortId = getVisitorShortId();

    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source');
    const utm_medium = params.get('utm_medium');
    const utm_campaign = params.get('utm_campaign');
    const referrer = document.referrer || null;
    const landing_page = window.location.pathname;

    const { data: existing } = await supabase
      .from(TABLE_VISITOR_PROFILES)
      .select('id, visit_count')
      .eq('id', visitorId)
      .maybeSingle();

    if (!existing) {
      await supabase.from(TABLE_VISITOR_PROFILES).insert({
        id: visitorId,
        short_id: shortId,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer,
        landing_page,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        visit_count: 1,
      });
    } else {
      const update: Record<string, unknown> = {
        last_seen: new Date().toISOString(),
        visit_count: (existing.visit_count ?? 0) + 1,
      };

      if (utm_source !== null) update.utm_source = utm_source;
      if (utm_medium !== null) update.utm_medium = utm_medium;
      if (utm_campaign !== null) update.utm_campaign = utm_campaign;
      if (referrer !== null) update.referrer = referrer;
      if (landing_page !== null) update.landing_page = landing_page;

      await supabase
        .from(TABLE_VISITOR_PROFILES)
        .update(update)
        .eq('id', visitorId);
    }
  } catch {
    // silently ignored
  }
}

interface SourceProfile {
  utm_source: string | null;
  utm_campaign: string | null;
  referrer: string | null;
}

function buildSourceLabel(profile: SourceProfile): string | null {
  const sourceParts: string[] = [];
  if (profile.utm_source) sourceParts.push(profile.utm_source);
  if (profile.utm_campaign) sourceParts.push(profile.utm_campaign);

  if (sourceParts.length > 0) {
    return sourceParts.join(' / ');
  }
  if (profile.referrer) {
    return profile.referrer;
  }
  return null;
}

export async function getVisitorSourceLabel(visitorId: string): Promise<string | null> {
  try {
    const { data: profile } = await supabase
      .from(TABLE_VISITOR_PROFILES)
      .select('utm_source, utm_campaign, referrer')
      .eq('id', visitorId)
      .maybeSingle();

    if (!profile) return null;

    return buildSourceLabel(profile as SourceProfile);
  } catch {
    return null;
  }
}

export async function getVisitorHistory(visitorId: string): Promise<string> {
  try {
    const { data: profile } = await supabase
      .from(TABLE_VISITOR_PROFILES)
      .select('short_id, first_seen, last_seen, visit_count, utm_source, utm_campaign, referrer')
      .eq('id', visitorId)
      .maybeSingle();

    if (!profile) return '';

    const { data: events } = await supabase
      .from(TABLE_CLICK_EVENTS)
      .select('*')
      .eq('visitor_id', visitorId)
      .order('created_at', { ascending: true });

    const source = buildSourceLabel(profile as SourceProfile) ?? VISITOR_SOURCE_DIRECT;

    const firstSeen = profile.first_seen ? formatDate(profile.first_seen) : '—';
    const lastSeen = profile.last_seen ? formatDateTime(profile.last_seen) : '—';
    const visitCount = profile.visit_count ?? 1;

    const rawLines = (events ?? [])
      .map(eventToLine)
      .filter((line): line is string => line !== null);

    const deduped = dedupeHistoryLines(rawLines);

    const maxLines = 15;
    const recentLines = deduped.slice(-maxLines);

    let historyBlock = '';
    if (recentLines.length > 0) {
      historyBlock = `\n\n${VISITOR_HISTORY_LABELS.history}\n${recentLines.join('\n')}`;
    }

    return `${VISITOR_HISTORY_LABELS.visitor} ${profile.short_id ?? VISITOR_SHORT_ID_FALLBACK}
${VISITOR_HISTORY_LABELS.source} ${source}
${VISITOR_HISTORY_LABELS.totalVisits} ${visitCount} (première visite le ${firstSeen})
${VISITOR_HISTORY_LABELS.lastVisit} ${lastSeen}${historyBlock}`;
  } catch {
    return '';
  }
}
