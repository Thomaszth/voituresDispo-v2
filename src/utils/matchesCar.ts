import { Voiture } from '../types/voiture';

export function matchesCar(car: Voiture, query: string): boolean {
  const totalPrice = car.ownerAskingPrice + car.serviceFee;
  const words = query.trim().split(/\s+/).filter(Boolean);

  const fourDigitNums = words.filter(w => /^\d{4}$/.test(w)).map(Number);
  if (fourDigitNums.length === 2) {
    const [a, b] = fourDigitNums.sort((x, y) => x - y);
    return car.year >= a && car.year <= b;
  }

  if (fourDigitNums.length === 1) {
    return car.year === fourDigitNums[0];
  }

  return words.every(word => {
    const lower = word.toLowerCase();

    if (/^\d+$/.test(word) && Number(word) > 1000) {
      return totalPrice <= Number(word);
    }

    const fields = [
      car.make,
      car.model,
      String(car.year),
      car.fuelType,
      car.transmission,
      car.motorType,
      car.color,
      car.mileage,
      String(car.ownerAskingPrice),
      String(totalPrice),
      car.vehicleLocation,
    ];

    return fields.some(f => f.toLowerCase().includes(lower));
  });
}
