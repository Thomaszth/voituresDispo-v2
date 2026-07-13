export const CATALOGUE_HERO_TITLE = 'Notre Collection';
export const CATALOGUE_HERO_SUBTITLE = 'Bienvenue';
export const PAGINATION_PREV = 'PRÉCÉDENT';
export const PAGINATION_NEXT = 'SUIVANT';

export const pageLabel = (currentPage: number, totalPages: number) =>
  `Page ${currentPage} / ${totalPages}`;

export const resultsCountMessage = (count: number) =>
  `${count} véhicule${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;

export const seenMessage = (shown: number, total: number) =>
  `Vous avez vu ${shown} véhicules sur ${total}`;
