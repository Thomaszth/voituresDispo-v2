import { Voiture } from '../../types/voiture';
import { LABEL_SECTION_DESCRIPTION } from '../../constants/carDetailLabels';

interface VoitureDetailDescriptionProps {
  car: Voiture;
}

export function VoitureDetailDescription({ car }: VoitureDetailDescriptionProps) {
  return (
    <div className="mb-12">
      <p className="font-jost font-light text-vd-caption uppercase mb-4 text-label tracking-widest">
        {LABEL_SECTION_DESCRIPTION}
      </p>
      <p className="font-jost font-light text-vd-meta text-description leading-relaxed">
        {car.description}
      </p>
    </div>
  );
}
