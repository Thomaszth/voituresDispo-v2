export interface Voiture {
  id: string;
  make: string;
  model: string;
  year: number;
  ownerAskingPrice: number;
  serviceFee: number;
  mileage: string;
  color: string;
  fuelType: "Essence" | "Diesel" | "Électrique" | "Hybride";
  licencePlateLetters: string;
  fuelConsumption: string;
  transmission: "Automatique" | "Manuelle";
  motorType: string;
  vehicleLocation: string;
  dealerPurchased: boolean;
  underWarranty: boolean | null;
  warrantyDetails: string | null;
  status: "available" | "sold";
  description: string;
  images: string[];
}
