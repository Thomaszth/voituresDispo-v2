interface GalleryThumbnailProps {
  image: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function GalleryThumbnail({ image, index, isActive, onClick }: GalleryThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 transition-opacity duration-150 rounded-sm w-15 h-15 md:w-20 md:h-20 border-vd-border p-0.5"
    >
      <img
        src={image}
        alt={`Thumbnail ${index + 1}`}
        className={`w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-70'}`}
      />
    </button>
  );
}
