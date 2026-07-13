export const RECHERCHES_PAGE_LABEL = 'recherches';

export const MSG_RECHERCHES_PAGE_VISIT = (
  count: number | string,
  url: string,
  visitorShortId: string,
  source: string
) =>
  `\u{1F4C4} Visite recherches #${count}\n${url}\n\u{1F464} ${visitorShortId} · ${source}`;
