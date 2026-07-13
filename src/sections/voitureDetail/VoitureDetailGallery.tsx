import { Voiture } from '../../types/voiture';
import { GalleryThumbnail } from '../../components/GalleryThumbnail';

interface VoitureDetailGalleryProps {
  car: Voiture;
  mainImage: string;
  isSold: boolean;
  onThumbnailClick: (image: string, index: number) => void;
}

export function VoitureDetailGallery({ car, mainImage, isSold, onThumbnailClick }: VoitureDetailGalleryProps) {
  return (
    <section className="w-full">
      <div
        className="w-full relative flex items-center justify-center bg-vd-black"
      >
        {isSold && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />
        )}
        <img
          src={mainImage}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full object-contain transition-opacity duration-200 max-h-[60vh] md:max-h-[75vh]"
        />
      </div>

      <div className="w-full bg-white px-5 md:px-8 lg:px-12 py-5 flex gap-3 overflow-x-auto">
        {car.images.map((image, idx) => (
          <GalleryThumbnail
            key={idx}
            image={image}
            index={idx}
            isActive={mainImage === image}
            onClick={() => onThumbnailClick(image, idx)}
          />
        ))}
      </div>
    </section>
  );
}
