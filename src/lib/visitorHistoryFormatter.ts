import { TIME_ON_PAGE_BUCKETS } from '../constants/visitorLabels';

export function eventToLine(e: Record<string, unknown>): string | null {
  const eventType = e.event_type as string;
  const voitureLabel = (e.voiture_label as string) ?? '';
  const searchQuery = (e.search_query as string) ?? '';

  switch (eventType) {
    case 'page_visit':
      if (voitureLabel === 'catalogue') return '• A visité le catalogue';
      if (voitureLabel === 'palmares') return '• A visité le palmarès';
      if (voitureLabel === 'recherches') return '• A visité la page recherches';
      if (voitureLabel.startsWith('/voitures/')) return `• A visité la fiche : ${voitureLabel}`;
      return null;
    case 'voir_vehicule':
      return `• A cliqué sur VOIR LE VÉHICULE : ${voitureLabel}`;
    case 'gallery_click':
      return `• A navigué dans la galerie : ${voitureLabel}`;
    case 'contacter_whatsapp':
      return `• A cliqué WhatsApp : ${voitureLabel}`;
    case 'partager_vehicule':
      return `• A partagé : ${voitureLabel}`;
    case 'search_query':
      return `• A recherché : ${searchQuery}`;
    case 'cta_palmares':
      return '• A cliqué sur CONFIER MON VÉHICULE';
    case 'form_started':
      return '• A commencé le formulaire vendeur';
    case 'pagination_depth':
      return `• A navigué en ${voitureLabel}`;
    case 'time_on_page':
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
