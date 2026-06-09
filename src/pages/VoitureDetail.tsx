import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Voiture } from '../types/voiture';
import Toast from '../components/Toast';
import { PriceRow } from '../components/PriceRow';
import { SpecCell } from '../components/SpecCell';
import { formatPrice } from '../utils/formatPrice';
import { supabase } from '../lib/supabase';
import { dbToVoiture, VoitureDB } from '../types/voitureDB';

export default function VoitureDetail() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Voiture | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('voitures')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const mapped = dbToVoiture(data as VoitureDB);
          setCar(mapped);
          setMainImage(mapped.images[0] ?? '');
        }
      });
  }, [id]);

  if (!car) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-jost text-vd-caption">Chargement...</p>
      </main>
    );
  }

  const isSold = car.status === 'sold';
  const totalPrice = car.ownerAskingPrice + car.serviceFee;

  const handleWhatsAppClick = () => {
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string;
    const message = `Bonjour, je suis intéressé(e) par la ${car.year} ${car.make} ${car.model} ${car.licencePlateLetters} disponible sur Voitures Dispo.\n\nVoici le lien vers le véhicule : ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-8 pb-6 px-5 md:px-8 lg:px-12">
        <Link
          to="/catalogue"
          className="font-jost uppercase font-light text-[11px] tracking-[0.18em] transition-colors duration-200"
          style={{ color: '#9A9A9A' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0A0A0A')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9A9A9A')}
        >
          ← RETOUR AU CATALOGUE
        </Link>
      </div>
      <section className="w-full">
        <div
          className="w-full relative flex items-center justify-center"
          style={{ backgroundColor: '#0A0A0A' }}
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
            <button
              key={idx}
              onClick={() => setMainImage(image)}
              className="flex-shrink-0 transition-opacity duration-150 rounded-sm w-15 h-15 md:w-20 md:h-20 border-vd-border p-0.5"
            >
              <img
                src={image}
                alt={`Thumbnail ${idx + 1}`}
                className={`w-full h-full object-cover ${mainImage === image ? 'opacity-100' : 'opacity-70'}`}
              />
            </button>
          ))}
        </div>
      </section>

      <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
        <div className="mb-6">
          <div
            className={`inline-block px-2 py-1 rounded-sm font-jost uppercase font-light text-badge tracking-widest ${
              isSold
                ? 'bg-vd-black text-white border-transparent'
                : 'bg-white text-vd-black border border-vd-border'
            }`}
          >
            {isSold ? 'VENDU' : 'DISPONIBLE'}
          </div>
        </div>

        <div className="mb-8">
          <p className="font-jost font-light text-vd-caption uppercase mb-3 text-label tracking-widest">
            Véhicule
          </p>
          <h1 className="font-cormorant font-light text-vd-text text-[clamp(32px,5vw,52px)] tracking-wide">
            {car.year} {car.make} {car.model}
          </h1>
        </div>

        <div className="bg-vd-surface border border-vd-border rounded-sm p-6 mb-8">
          <PriceRow
            label="Prix demandé par le propriétaire"
            value={formatPrice(car.ownerAskingPrice)}
            bold={false}
            divider={true}
          />
          <PriceRow
            label="Frais de service de Voitures Dispo"
            value={formatPrice(car.serviceFee)}
            bold={false}
            divider={true}
          />
          <PriceRow
            label="PRIX TOTAL"
            value={formatPrice(totalPrice)}
            bold={true}
            divider={false}
          />
        </div>

        <div className="border-t border-vd-border mb-8" />

        <div className="mb-8">
          <p className="font-jost font-light text-vd-caption uppercase mb-6 text-label tracking-widest">
            Caractéristiques
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <SpecCell label="Série / Immatriculation" value={car.licencePlateLetters} />
            <SpecCell label="Kilométrage" value={car.mileage} />
            <SpecCell label="Carburant" value={car.fuelType} />
            <SpecCell label="Consommation" value={car.fuelConsumption} />
            <SpecCell label="Transmission" value={car.transmission} />
            <SpecCell label="Motorisation" value={car.motorType} />
            <SpecCell label="Couleur" value={car.color} />
            <SpecCell label="Localisation" value={car.vehicleLocation} />
            <SpecCell
              label="Provenance"
              value={
                car.dealerPurchased
                  ? 'Acheté chez un concessionnaire'
                  : 'Particulier'
              }
            />
            {car.underWarranty !== null && (
              <SpecCell
                label="Garantie"
                value={
                  car.underWarranty
                    ? car.warrantyDetails || ''
                    : 'Non garantie'
                }
              />
            )}
          </div>
        </div>

        <div className="border-t border-vd-border mb-8" />

        <div className="mb-12">
          <p className="font-jost font-light text-vd-caption uppercase mb-4 text-label tracking-widest">
            Description
          </p>
          <p className="font-jost font-light text-vd-meta text-description leading-relaxed">
            {car.description}
          </p>
        </div>

        {isSold ? (
          <div className="flex flex-col items-center text-center py-12 gap-4">
            <div className="w-12 border-t border-vd-border" />
            <p className="font-cormorant font-light italic text-vd-caption text-xl">
              Ce véhicule a trouvé son propriétaire.
            </p>
            <div className="w-12 border-t border-vd-border" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleWhatsAppClick}
              className="bg-vd-black text-white font-jost uppercase font-light py-3 px-6 rounded-sm transition-colors duration-200 hover:bg-gray-800 text-xs tracking-widest"
            >
              Contacter sur WhatsApp
            </button>
            <button
              onClick={handleShareClick}
              className="bg-white text-vd-black border border-vd-black font-jost uppercase font-light py-3 px-6 rounded-sm transition-colors duration-200 hover:bg-vd-surface text-xs tracking-widest"
            >
              {copyToast ? 'Lien Copié' : 'Partager ce véhicule'}
            </button>
          </div>
        )}
      </section>

      {copyToast && <Toast message="Lien copié." />}
    </main>
  );
}
