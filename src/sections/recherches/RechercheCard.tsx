import type { RechercheDB } from '../../hooks/useRecherches';
import { supabase } from '../../lib/supabase';
import { sendTelegramNotification, THREAD_IDS } from '../../lib/telegram';
import { getOrCreateVisitorId, getVisitorShortId, getVisitorHistory } from '../../lib/visitor';

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER as string;

interface RechercheCardProps {
  recherche: RechercheDB;
}

function buildWhatsAppUrl(recherche: RechercheDB): string {
  const message = `Bonjour, j'ai vu sur Voitures Dispo que vous recherchez : ${recherche.carName} — ${recherche.specifics}. Je possède ce type de véhicule et je suis intéressé(e) par une vente. Pouvez-vous me recontacter ?`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function buildTrackingLabel(recherche: RechercheDB): string {
  const label = `${recherche.carName} — ${recherche.specifics ?? ''}`;
  return label.length > 200 ? label.slice(0, 200) : label;
}

export function RechercheCard({ recherche }: RechercheCardProps) {
  const hasBudgetNote = recherche.budgetNote && recherche.budgetNote.trim().length > 0;

  const handleWhatsAppClick = () => {
    const label = buildTrackingLabel(recherche);
    const tracking = async () => {
      try {
        await supabase.from('click_events').insert({
          event_type: 'contacter_whatsapp',
          voiture_id: null,
          voiture_label: label,
          voiture_url: window.location.href,
          search_query: null,
          visitor_id: getOrCreateVisitorId(),
          visitor_short_id: getVisitorShortId(),
        });
        const { count } = await supabase
          .from('click_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'contacter_whatsapp')
          .eq('voiture_label', label);
        const visitorId = getOrCreateVisitorId();
        const history = await getVisitorHistory(visitorId);
        const historyBlock = history ? `\n${history}` : '';
        await sendTelegramNotification(
          `\u{1F697} Proposition vendeur #${count ?? '?'} pour :\n*${recherche.carName}*\n${recherche.specifics ?? ''}${historyBlock}`,
          String(THREAD_IDS.carSellerLeads)
        );
      } catch {
        // silently ignored
      }
    };
    Promise.race([
      tracking(),
      new Promise<void>(resolve => setTimeout(resolve, 800)),
    ]).finally(() => {
      window.open(buildWhatsAppUrl(recherche), '_blank');
    });
  };

  return (
    <div
      className="group overflow-hidden transition-shadow duration-300 hover:shadow-subtle-md"
      style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '2px' }}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
        {recherche.photo ? (
          <img
            src={recherche.photo}
            alt={recherche.carName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: '#F5F5F5' }}
          >
            <span
              className="font-jost uppercase"
              style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#9A9A9A' }}
            >
              PHOTO À VENIR
            </span>
          </div>
        )}
        <div
          className="absolute top-3 left-3 font-jost uppercase"
          style={{
            background: '#0A0A0A',
            color: '#FFFFFF',
            fontSize: '9px',
            letterSpacing: '0.18em',
            padding: '4px 8px',
            borderRadius: '2px',
          }}
        >
          RECHERCHE ACTIVE
        </div>
      </div>

      <div className="p-5">
        <h3
          className="font-cormorant font-light"
          style={{ fontSize: '21px', color: '#0A0A0A', lineHeight: '1.2' }}
        >
          {recherche.carName}
        </h3>
        <p
          className="font-jost font-light mt-2.5"
          style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: '1.7' }}
        >
          {recherche.specifics}
        </p>

        {hasBudgetNote && (
          <>
            <div className="my-3.5" style={{ height: '1px', background: '#E0E0E0' }} />
            <p
              className="font-jost uppercase"
              style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#9A9A9A' }}
            >
              NOTE
            </p>
            <p
              className="font-jost font-light mt-1"
              style={{ fontSize: '13px', color: '#6B6B6B' }}
            >
              {recherche.budgetNote}
            </p>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid #E0E0E0' }}>
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="block w-full font-jost uppercase font-light transition-colors duration-200 hover:bg-[#222222]"
          style={{
            background: '#0A0A0A',
            color: '#FFFFFF',
            letterSpacing: '0.15em',
            fontSize: '11px',
            padding: '16px 20px',
            borderRadius: '0',
          }}
        >
          J'AI CE VÉHICULE →
        </button>
      </div>
    </div>
  );
}
