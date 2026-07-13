import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Voiture } from '../types/voiture';
import Toast from '../components/Toast';
import { ActionButton } from '../components/ActionButton';
import { BackToCatalogueLink } from '../components/BackToCatalogueLink';
import { VoitureDetailGallery } from '../sections/voitureDetail/VoitureDetailGallery';
import { VoitureDetailInfo } from '../sections/voitureDetail/VoitureDetailInfo';
import { VoitureDetailSpecs } from '../sections/voitureDetail/VoitureDetailSpecs';
import { VoitureDetailDescription } from '../sections/voitureDetail/VoitureDetailDescription';
import { supabase } from '../lib/supabase';
import { dbToVoiture, VoitureDB } from '../types/voitureDB';
import { THREAD_IDS } from '../lib/telegram';
import { trackSession } from '../lib/session';
import { useCarPageTracking } from '../hooks/useCarPageTracking';
import { useTimeOnPageTracking } from '../hooks/useTimeOnPageTracking';
import { trackViewContent, trackContact } from '../lib/pixel';
import {
  LABEL_SOLD_MESSAGE,
  LABEL_BTN_WHATSAPP,
  LABEL_BTN_SHARE,
  LABEL_BTN_LINK_COPIED,
  LABEL_LOADING,
  LABEL_TOAST_LINK_COPIED,
  WHATSAPP_MESSAGE_TEMPLATE,
  NATIVE_SHARE_TITLE_TEMPLATE,
  NATIVE_SHARE_TEXT,
} from '../constants/carDetailLabels';
import {
  MSG_PAGE_VISIT,
  MSG_WHATSAPP_CLICK,
  MSG_SHARE_CLICK,
  MSG_GALLERY_CLICK,
  WHATSAPP_TRACKING_TIMEOUT_MS,
  SHARE_TRACKING_TIMEOUT_MS,
  COPY_TOAST_DURATION_MS,
} from '../constants/notificationMessages';

export default function VoitureDetail() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Voiture | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [copyToast, setCopyToast] = useState(false);
  const { trackAndNotify } = useCarPageTracking();

  useTimeOnPageTracking(car);

  useEffect(() => {
    // Page visit tracking — fire-and-forget
    (async () => {
      try {
        await trackSession();
        const label = '/voitures/' + id;
        await trackAndNotify({
          eventType: 'page_visit',
          voitureId: id ?? '',
          voitureLabel: label,
          voitureUrl: window.location.href,
          threadId: String(THREAD_IDS.carPageVisit),
          countFilterField: 'voiture_label',
          buildMessage: (count, visitorShortId, source) =>
            MSG_PAGE_VISIT(count, label, window.location.href, visitorShortId, source),
        });
      } catch {
        // silently ignored
      }
    })();
  }, [id]);

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
          trackViewContent(mapped);
        }
      });
  }, [id]);

  if (!car) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-jost text-vd-caption">{LABEL_LOADING}</p>
      </main>
    );
  }

  const isSold = car.status === 'sold';

  const voitureLabel = `${car.year} ${car.make} ${car.model} ${car.licencePlateLetters}`;
  const voitureUrl = `${window.location.origin}/voitures/${car.id}`;

  const openWhatsApp = () => {
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string;
    const message = WHATSAPP_MESSAGE_TEMPLATE(car.year, car.make, car.model, car.licencePlateLetters, window.location.href);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleWhatsAppClick = () => {
    trackContact(car);
    const tracking = async () => {
      try {
        await trackAndNotify({
          eventType: 'contacter_whatsapp',
          voitureId: car.id,
          voitureLabel,
          voitureUrl,
          threadId: String(THREAD_IDS.contacterWhatsapp),
          withHistory: true,
          buildMessage: (count, _visitorShortId, historyBlock) =>
            MSG_WHATSAPP_CLICK(count, voitureLabel, voitureUrl, historyBlock),
        });
      } catch {
        // silently ignored
      }
    };

    Promise.race([
      tracking(),
      new Promise<void>(resolve => setTimeout(resolve, WHATSAPP_TRACKING_TIMEOUT_MS)),
    ]).finally(() => {
      openWhatsApp();
    });
  };

  const executeShare = async () => {
    // Mobile: use native share sheet if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: NATIVE_SHARE_TITLE_TEMPLATE(car.year, car.make, car.model),
          text: NATIVE_SHARE_TEXT,
          url: window.location.href,
        });
      } catch {
        // User dismissed share sheet (AbortError) — silent
      }
      return;
    }
    // Desktop: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), COPY_TOAST_DURATION_MS);
    } catch {
      // Fallback
    }
  };

  const handleShareClick = () => {
    const tracking = async () => {
      try {
        await trackAndNotify({
          eventType: 'partager_vehicule',
          voitureId: car.id,
          voitureLabel,
          voitureUrl,
          threadId: String(THREAD_IDS.partagerVehicule),
          buildMessage: (count, visitorShortId, source) =>
            MSG_SHARE_CLICK(count, voitureLabel, voitureUrl, visitorShortId, source),
        });
      } catch {
        // silently ignored
      }
    };

    Promise.race([
      tracking(),
      new Promise<void>(resolve => setTimeout(resolve, SHARE_TRACKING_TIMEOUT_MS)),
    ]).finally(() => {
      executeShare();
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="pt-8 pb-6 px-5 md:px-8 lg:px-12">
        <BackToCatalogueLink />
      </div>
      <VoitureDetailGallery
        car={car}
        mainImage={mainImage}
        isSold={isSold}
        onThumbnailClick={(image, idx) => {
          setMainImage(image);
          (async () => {
            try {
              await trackAndNotify({
                eventType: 'gallery_click',
                voitureId: car.id,
                voitureLabel,
                voitureUrl,
                threadId: String(THREAD_IDS.clicksThroughCarThumbnailsOfCarPage),
                buildMessage: (count, visitorShortId, source) =>
                  MSG_GALLERY_CLICK(idx + 1, voitureLabel, count, voitureUrl, visitorShortId, source),
              });
            } catch {
              // silently ignored
            }
          })();
        }}
      />

      <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
        <VoitureDetailInfo car={car} isSold={isSold} />

        <VoitureDetailSpecs car={car} />

        <div className="border-t border-vd-border mb-8" />

        <VoitureDetailDescription car={car} />

        {isSold ? (
          <div className="flex flex-col items-center text-center py-12 gap-4">
            <div className="w-12 border-t border-vd-border" />
            <p className="font-cormorant font-light italic text-vd-caption text-xl">
              {LABEL_SOLD_MESSAGE}
            </p>
            <div className="w-12 border-t border-vd-border" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionButton
              text={LABEL_BTN_WHATSAPP}
              onClick={handleWhatsAppClick}
              variant="primary"
            />
            <ActionButton
              text={copyToast ? LABEL_BTN_LINK_COPIED : LABEL_BTN_SHARE}
              onClick={handleShareClick}
              variant="secondary"
            />
          </div>
        )}
      </section>

      {copyToast && <Toast message={LABEL_TOAST_LINK_COPIED} />}
    </main>
  );
}
