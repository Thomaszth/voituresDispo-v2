export const VISITOR_SHORT_ID_PREFIX = 'vst-';
export const VISITOR_SHORT_ID_FALLBACK = 'vst-inconnu';

export const VISITOR_SOURCE_DIRECT = 'Accès direct';

export const TABLE_VISITOR_PROFILES = 'visitor_profiles';
export const TABLE_CLICK_EVENTS = 'click_events';

export const VISITOR_HISTORY_LABELS = {
  visitor: '👤 Visiteur :',
  source: '📍 Source :',
  totalVisits: '🔁 Visites totales :',
  lastVisit: '🕐 Dernière visite :',
  history: '📋 Historique :',
} as const;

export const TIME_ON_PAGE_BUCKETS = {
  readInDetail: 'lu_en_detail',
  readQuickly: 'lu_rapidement',
  bounce: 'rebond',
} as const;
