import { Voiture } from '../types/voiture';

export function trackViewContent(car: Voiture) {
  if (typeof fbq === 'undefined') return;
  fbq('track', 'ViewContent', {
    content_name: `${car.year} ${car.make} ${car.model}`,
    content_ids: [car.id],
    content_type: 'vehicle',
    value: car.displayedPrice,
    currency: 'XOF',
  });
}

export function trackContact(car: Voiture) {
  if (typeof fbq === 'undefined') return;
  fbq('track', 'Contact', {
    content_name: `${car.year} ${car.make} ${car.model}`,
    content_ids: [car.id],
  });
}
