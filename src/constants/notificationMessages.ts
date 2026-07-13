export const MSG_PAGE_VISIT = (
  count: number | string,
  label: string,
  url: string,
  visitorShortId: string,
  source: string
) =>
  `\u{1F4C4} Visite fiche #${count} — *${label}*\n${url}\n\u{1F464} ${visitorShortId} · ${source}`;

export const MSG_PALMARES_VISIT = (
  count: number | string,
  url: string,
  visitorShortId: string,
  source: string
) =>
  `\u{1F4C4} Visite palmarès #${count}\n${url}\n\u{1F464} ${visitorShortId} · ${source}`;

export const MSG_WHATSAPP_CLICK = (
  count: number | string,
  voitureLabel: string,
  voitureUrl: string,
  historyBlock: string
) =>
  `\u{1F4AC} Contact WhatsApp #${count} — *${voitureLabel}*\n${voitureUrl}${historyBlock}`;

export const MSG_SHARE_CLICK = (
  count: number | string,
  voitureLabel: string,
  voitureUrl: string,
  visitorShortId: string,
  source: string
) =>
  `\u{1F517} Click partage #${count} sur *${voitureLabel}*\n${voitureUrl}\n\u{1F464} ${visitorShortId} · ${source}`;

export const MSG_GALLERY_CLICK = (
  photoIndex: number,
  voitureLabel: string,
  count: number | string,
  voitureUrl: string,
  visitorShortId: string,
  source: string
) =>
  `\u{1F5BC} Photo #${photoIndex} sur *${voitureLabel}* (galerie vue ${count} fois)\n${voitureUrl}\n\u{1F464} ${visitorShortId} · ${source}`;

export const MSG_TIME_ON_PAGE = (
  voitureLabel: string,
  bucket: string,
  elapsed: number,
  voitureUrl: string,
  visitorShortId: string,
  source: string
) =>
  `\u23F1 *${voitureLabel}* — ${bucket} (${elapsed} secondes)\n${voitureUrl}\n\u{1F464} ${visitorShortId} · ${source}`;

export const MSG_CATALOGUE_VISIT = (
  count: number | string,
  url: string,
  visitorShortId: string,
  source: string
) =>
  `\u{1F4C4} Visite catalogue #${count}\n${url}\n\u{1F464} ${visitorShortId} · ${source}`;

export const MSG_PAGINATION_DEPTH = (
  page: number,
  count: number | string,
  searchQuery: string | null,
  visitorShortId: string,
  source: string
) =>
  `\u{1F4CB} Page ${page} du catalogue visitée #${count} fois\nRecherche active : ${searchQuery ?? 'aucune'}\n\u{1F464} ${visitorShortId} · ${source}`;

export const TIME_BUCKET_REBOND_THRESHOLD = 10;
export const TIME_BUCKET_QUICK_READ_THRESHOLD = 60;

export const WHATSAPP_TRACKING_TIMEOUT_MS = 800;
export const SHARE_TRACKING_TIMEOUT_MS = 800;
export const COPY_TOAST_DURATION_MS = 2000;
