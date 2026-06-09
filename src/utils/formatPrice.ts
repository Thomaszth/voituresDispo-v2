export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
