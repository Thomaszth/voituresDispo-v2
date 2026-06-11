export interface PalmaresDB {
  id: string;
  car_name: string;
  photo: string;
  owner_asking_price: number;
  final_sale_price: number;
  days_to_sell: number;
  comment: string;
  created_at: string;
}

export interface Palmares {
  id: string;
  carName: string;
  photo: string;
  ownerAskingPrice: number;
  finalSalePrice: number;
  daysToSell: number;
  comment: string;
}

export function dbToPalmares(v: PalmaresDB): Palmares {
  return {
    id: v.id,
    carName: v.car_name,
    photo: v.photo,
    ownerAskingPrice: Number(v.owner_asking_price),
    finalSalePrice: Number(v.final_sale_price),
    daysToSell: v.days_to_sell,
    comment: v.comment,
  };
}

export interface PalmaresLeadDB {
  id: string;
  full_name: string;
  phone: string;
  vehicle_name: string | null;
  asking_price: string | null;
  submitted_at: string;
}
