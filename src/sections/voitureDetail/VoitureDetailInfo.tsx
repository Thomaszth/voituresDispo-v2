import { Voiture } from '../../types/voiture';
import { formatPrice } from '../../utils/formatPrice';
import {
  LABEL_STATUS_SOLD,
  LABEL_STATUS_AVAILABLE,
  LABEL_SECTION_VEHICLE,
  LABEL_SECTION_PRICE,
} from '../../constants/carDetailLabels';

interface VoitureDetailInfoProps {
  car: Voiture;
  isSold: boolean;
}

export function VoitureDetailInfo({ car, isSold }: VoitureDetailInfoProps) {
  return (
    <>
      <div className="mb-6">
        <div
          className={`inline-block px-2 py-1 rounded-sm font-jost uppercase font-light text-badge tracking-widest ${
            isSold
              ? 'bg-vd-black text-white border-transparent'
              : 'bg-white text-vd-black border border-vd-border'
          }`}
        >
          {isSold ? LABEL_STATUS_SOLD : LABEL_STATUS_AVAILABLE}
        </div>
      </div>

      <div className="mb-8">
        <p className="font-jost font-light text-vd-caption uppercase mb-3 text-label tracking-widest">
          {LABEL_SECTION_VEHICLE}
        </p>
        <h1 className="font-cormorant font-light text-vd-text text-[clamp(32px,5vw,52px)] tracking-wide">
          {car.year} {car.make} {car.model}
        </h1>
      </div>

      <div className="mb-8">
        <p className="font-jost font-light uppercase mb-3 text-[10px] tracking-[0.25em] text-vd-caption">
          {LABEL_SECTION_PRICE}
        </p>
        <p className="font-cormorant font-light text-vd-text leading-none text-[clamp(32px,4vw,48px)]">
          {formatPrice(car.displayedPrice)}
        </p>
        <div className="border-t border-vd-border mt-6" />
      </div>
    </>
  );
}
