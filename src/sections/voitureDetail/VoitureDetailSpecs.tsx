import { Voiture } from '../../types/voiture';
import { SpecCell } from '../../components/SpecCell';
import {
  LABEL_SECTION_SPECS,
  LABEL_SPEC_SERIES,
  LABEL_SPEC_MILEAGE,
  LABEL_SPEC_FUEL,
  LABEL_SPEC_CONSUMPTION,
  LABEL_SPEC_TRANSMISSION,
  LABEL_SPEC_ENGINE,
  LABEL_SPEC_COLOR,
  LABEL_SPEC_LOCATION,
  LABEL_SPEC_ORIGIN,
  LABEL_SPEC_WARRANTY,
  VALUE_ORIGIN_DEALER,
  VALUE_ORIGIN_PRIVATE,
  VALUE_WARRANTY_NONE,
} from '../../constants/carDetailLabels';

interface VoitureDetailSpecsProps {
  car: Voiture;
}

export function VoitureDetailSpecs({ car }: VoitureDetailSpecsProps) {
  return (
    <div className="mb-8">
      <p className="font-jost font-light text-vd-caption uppercase mb-6 text-label tracking-widest">
        {LABEL_SECTION_SPECS}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <SpecCell label={LABEL_SPEC_SERIES} value={car.licencePlateLetters} />
        <SpecCell label={LABEL_SPEC_MILEAGE} value={car.mileage} />
        <SpecCell label={LABEL_SPEC_FUEL} value={car.fuelType} />
        <SpecCell label={LABEL_SPEC_CONSUMPTION} value={car.fuelConsumption} />
        <SpecCell label={LABEL_SPEC_TRANSMISSION} value={car.transmission} />
        <SpecCell label={LABEL_SPEC_ENGINE} value={car.motorType} />
        <SpecCell label={LABEL_SPEC_COLOR} value={car.color} />
        <SpecCell label={LABEL_SPEC_LOCATION} value={car.vehicleLocation} />
        <SpecCell
          label={LABEL_SPEC_ORIGIN}
          value={
            car.dealerPurchased
              ? VALUE_ORIGIN_DEALER
              : VALUE_ORIGIN_PRIVATE
          }
        />
        {car.underWarranty !== null && (
          <SpecCell
            label={LABEL_SPEC_WARRANTY}
            value={
              car.underWarranty
                ? car.warrantyDetails || ''
                : VALUE_WARRANTY_NONE
            }
          />
        )}
      </div>
    </div>
  );
}
