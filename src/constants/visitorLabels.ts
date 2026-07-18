export const VISITOR_SHORT_ID_PREFIX = 'vst-';
export const VISITOR_SHORT_ID_FALLBACK = 'vst-inconnu';

export const VISITOR_SOURCE_DIRECT = 'Accès direct';

import { TABLE_NAMES } from './tableNames';

export const TABLE_VISITOR_PROFILES = TABLE_NAMES.VISITOR_PROFILES;
export const TABLE_CLICK_EVENTS = TABLE_NAMES.CLICK_EVENTS;

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
