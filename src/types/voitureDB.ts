export interface VoitureDB {
  id: string;
  make: string;
  model: string;
  year: number;
  owner_asking_price: number;
  service_fee: number;
  mileage: string;
  color: string;
  fuel_type: 'Essence' | 'Diesel' | 'Électrique' | 'Hybride';
  licence_plate_letters: string;
  fuel_consumption: string;
  transmission: 'Automatique' | 'Manuelle';
  motor_type: string;
  vehicle_location: string;
  dealer_purchased: boolean;
  under_warranty: boolean | null;
  warranty_details: string | null;
  status: 'available' | 'sold';
  description: string;
  images: string[];
  created_at: string;
  sort_order: number;
}

export function dbToVoiture(v: VoitureDB) {
  return {
    id: v.id,
    make: v.make,
    model: v.model,
    year: v.year,
    ownerAskingPrice: v.owner_asking_price,
    serviceFee: v.service_fee,
    mileage: v.mileage,
    color: v.color,
    fuelType: v.fuel_type,
    licencePlateLetters: v.licence_plate_letters,
    fuelConsumption: v.fuel_consumption,
    transmission: v.transmission,
    motorType: v.motor_type,
    vehicleLocation: v.vehicle_location,
    dealerPurchased: v.dealer_purchased,
    underWarranty: v.under_warranty,
    warrantyDetails: v.warranty_details,
    status: v.status,
    description: v.description,
    images: v.images,
  };
}
