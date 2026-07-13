export const LABEL_BACK_LINK = '← RETOUR AU CATALOGUE';

export const LABEL_STATUS_SOLD = 'VENDU';
export const LABEL_STATUS_AVAILABLE = 'DISPONIBLE';

export const LABEL_SECTION_VEHICLE = 'Véhicule';
export const LABEL_SECTION_PRICE = 'PRIX';
export const LABEL_SECTION_SPECS = 'Caractéristiques';
export const LABEL_SECTION_DESCRIPTION = 'Description';

export const LABEL_SPEC_SERIES = 'Série / Immatriculation';
export const LABEL_SPEC_MILEAGE = 'Kilométrage';
export const LABEL_SPEC_FUEL = 'Carburant';
export const LABEL_SPEC_CONSUMPTION = 'Consommation';
export const LABEL_SPEC_TRANSMISSION = 'Transmission';
export const LABEL_SPEC_ENGINE = 'Motorisation';
export const LABEL_SPEC_COLOR = 'Couleur';
export const LABEL_SPEC_LOCATION = 'Localisation';
export const LABEL_SPEC_ORIGIN = 'Provenance';
export const LABEL_SPEC_WARRANTY = 'Garantie';

export const VALUE_ORIGIN_DEALER = 'Acheté chez un concessionnaire';
export const VALUE_ORIGIN_PRIVATE = 'Particulier';
export const VALUE_WARRANTY_NONE = 'Non garantie';

export const LABEL_SOLD_MESSAGE = 'Ce véhicule a trouvé son propriétaire.';

export const LABEL_BTN_WHATSAPP = 'Contacter sur WhatsApp';
export const LABEL_BTN_SHARE = 'Partager ce véhicule';
export const LABEL_BTN_LINK_COPIED = 'LIEN COPIÉ ✓';

export const LABEL_LOADING = 'Chargement...';

export const LABEL_TOAST_LINK_COPIED = 'Lien copié.';

export const WHATSAPP_MESSAGE_TEMPLATE = (
  year: number,
  make: string,
  model: string,
  licencePlate: string,
  url: string
) =>
  `Bonjour, je suis intéressé(e) par la ${year} ${make} ${model} ${licencePlate} disponible sur Voitures Dispo.\n\nVoici le lien vers le véhicule : ${url}`;

export const NATIVE_SHARE_TITLE_TEMPLATE = (year: number, make: string, model: string) =>
  `${year} ${make} ${model} — Voitures Dispo`;

export const NATIVE_SHARE_TEXT = "J'ai trouvé ce véhicule sur Voitures Dispo :";
