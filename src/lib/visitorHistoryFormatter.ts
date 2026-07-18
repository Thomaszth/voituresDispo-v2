import { EVENT_TYPES } from '../constants/eventTypes';
import { PAGE_LABELS, VOITURE_DETAIL_PATH_PREFIX } from '../constants/pageLabels';
import { TIME_ON_PAGE_BUCKETS } from '../constants/visitorLabels';

export function eventToLine(e: Record<string, unknown>): string | null {
  const eventType = e.event_type as string;
  const voitureLabel = (e.voiture_label as string) ?? '';
  const searchQuery = (e.search_query as string) ?? '';

  switch (eventType) {
    case EVENT_TYPES.PAGE_VISIT:
      if (voitureLabel === PAGE_LABELS.CATALOGUE) return '• A visité le catalogue';
      if (voitureLabel === PAGE_LABELS.PALMARES) return '• A visité le palmarès';
      if (voitureLabel === PAGE_LABELS.RECHERCHES) return '• A visité la page recherches';
      if (voitureLabel.startsWith(VOITURE_DETAIL_PATH_PREFIX)) return `• A visité la fiche : ${voitureLabel}`;
      return null;
    case EVENT_TYPES.VOIR_VEHICULE:
      return `• A cliqué sur VOIR LE VÉHICULE : ${voitureLabel}`;
    case EVENT_TYPES.GALLERY_CLICK:
      return `• A navigué dans la galerie : ${voitureLabel}`;
    case EVENT_TYPES.CONTACTER_WHATSAPP:
      return `• A cliqué WhatsApp : ${voitureLabel}`;
    case EVENT_TYPES.PARTAGER_VEHICULE:
      return `• A partagé : ${voitureLabel}`;
    case EVENT_TYPES.SEARCH_QUERY:
      return `• A recherché : ${searchQuery}`;
    case EVENT_TYPES.CTA_PALMARES:
      return '• A cliqué sur CONFIER MON VÉHICULE';
    case EVENT_TYPES.FORM_STARTED:
      return '• A commencé le formulaire vendeur';
    case EVENT_TYPES.PAGINATION_DEPTH:
      return `• A navigué en ${voitureLabel}`;
    case EVENT_TYPES.TIME_ON_PAGE:
      if (searchQuery === TIME_ON_PAGE_BUCKETS.readInDetail) return `• A lu en détail : ${voitureLabel}`;
      if (searchQuery === TIME_ON_PAGE_BUCKETS.readQuickly) return `• A lu rapidement : ${voitureLabel}`;
      if (searchQuery === TIME_ON_PAGE_BUCKETS.bounce) return null;
      return null;
    default:
      return null;
  }
}

// Collapse consecutive identical history lines into a single line with a "(xN)" count suffix.
export function dedupeHistoryLines(lines: string[]): string[] {
  const deduped: string[] = [];
  for (const line of lines) {
    const last = deduped[deduped.length - 1];
    if (last === line) {
      const match = last.match(/\(x(\d+)\)$/);
      if (match) {
        deduped[deduped.length - 1] = `${line.slice(0, line.length - match[0].length)}(x${parseInt(match[1], 10) + 1})`;
      } else {
        deduped[deduped.length - 1] = `${line} (x2)`;
      }
    } else {
      deduped.push(line);
    }
  }
  return deduped;
}
