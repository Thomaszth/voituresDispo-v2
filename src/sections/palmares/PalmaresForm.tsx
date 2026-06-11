import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID as string;
const THREAD_ID = Number(import.meta.env.VITE_TELEGRAM_CAR_SELLER_LEADS_MESSAGE_THREAD_ID);

function formatDateNow(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} à ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

async function sendTelegram(text: string) {
  try {
    const body: Record<string, unknown> = {
      chat_id: CHAT_ID,
      parse_mode: 'Markdown',
      text,
    };
    if (THREAD_ID) {
      body.message_thread_id = Number(THREAD_ID);
    }
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // silently ignored
  }
}

const inputStyle =
  'w-full border border-vd-border bg-white font-jost font-light text-vd-text py-[14px] px-4 text-sm focus:outline-none focus:border-vd-text transition-colors duration-150';
const labelStyle: React.CSSProperties = { fontSize: '10px', letterSpacing: '0.18em', color: '#9A9A9A', textTransform: 'uppercase', display: 'block', marginBottom: '8px' };
const errorStyle: React.CSSProperties = { fontSize: '11px', color: '#9A9A9A', marginTop: '6px' };
const helperStyle: React.CSSProperties = { fontSize: '11px', color: '#9A9A9A', marginBottom: '8px' };

interface PalmaresFormProps {
  onStepChange: (step: number) => void;
}

export function PalmaresForm({ onStepChange }: PalmaresFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    onStepChange(currentStep);
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (currentStep === 3) {
      const t = setTimeout(() => setFadeIn(true), 50);
      return () => clearTimeout(t);
    }
  }, [currentStep]);

  const goNext = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!fullName.trim()) newErrors.fullName = 'Ce champ est obligatoire.';
      if (!phone.trim()) newErrors.phone = 'Ce champ est obligatoire.';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      sendTelegram(
        `*🚗 Nouveau contact — Palmarès*\n\n*Nom :* ${fullName.trim()}\n*Téléphone :* ${phone.trim()}\n*Statut :* Contact capturé (étape 1) ⏳\n*Reçu le :* ${formatDateNow()}`
      );
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!vehicleName.trim()) newErrors.vehicleName = 'Ce champ est obligatoire.';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      try {
        supabase.from('palmares_leads').insert({
          full_name: fullName.trim(),
          phone: phone.trim(),
          vehicle_name: vehicleName.trim(),
          asking_price: askingPrice.trim() || null,
        });
      } catch {
        // silently ignored
      }
      const priceDisplay = askingPrice.trim() || 'Non renseigné';
      sendTelegram(
        `*✅ Demande complète — Palmarès*\n\n*Nom :* ${fullName.trim()}\n*Téléphone :* ${phone.trim()}\n*Véhicule :* ${vehicleName.trim()}\n*Prix souhaité :* ${priceDisplay}\n*Statut :* Demande complète ✅\n*Reçu le :* ${formatDateNow()}`
      );
      setErrors({});
      setCurrentStep(3);
    }
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep(1);
  };

  const prenom = fullName.trim().split(/\s+/)[0] || '';

  const steps = [1, 2, 3];

  return (
    <section id="confier-form" className="w-full bg-white py-14 md:py-20 px-6">
      <div className="w-full" style={{ maxWidth: '560px', margin: '0 auto' }}>
        <p className="font-jost uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}>
          CONFIER MON VÉHICULE
        </p>
        <h2 className="font-cormorant font-light text-vd-text mt-3" style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}>
          Parlez-nous de votre véhicule
        </h2>
        <p className="font-jost font-light mt-3 mb-10" style={{ fontSize: '13px', color: '#6B6B6B' }}>
          Deux étapes. Moins d'une minute. Nous vous recontactons rapidement.
        </p>

        {currentStep < 3 && (
          <div className="flex items-center justify-center gap-1.5 mb-8">
            {steps.map(step => (
              <div
                key={step}
                className="transition-all duration-200"
                style={{
                  width: currentStep === step ? '20px' : '8px',
                  height: '4px',
                  borderRadius: '2px',
                  background: currentStep === step ? '#0A0A0A' : '#E0E0E0',
                }}
              />
            ))}
          </div>
        )}

        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="font-jost" style={labelStyle}>
                PRÉNOM ET NOM
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors(prev => { const n = { ...prev }; delete n.fullName; return n; }); }}
                placeholder="Votre nom complet"
                className={inputStyle}
                style={{ borderRadius: '2px' }}
              />
              {errors.fullName && <p className="font-jost font-light" style={errorStyle}>{errors.fullName}</p>}
            </div>
            <div>
              <label className="font-jost" style={labelStyle}>
                NUMÉRO DE TÉLÉPHONE
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(prev => { const n = { ...prev }; delete n.phone; return n; }); }}
                placeholder="Ex : +229 01 23 45 67"
                className={inputStyle}
                style={{ borderRadius: '2px' }}
              />
              {errors.phone && <p className="font-jost font-light" style={errorStyle}>{errors.phone}</p>}
            </div>
            <button
              onClick={goNext}
              className="w-full bg-vd-black text-white font-jost uppercase font-light transition-colors duration-200 hover:bg-gray-800"
              style={{ letterSpacing: '0.15em', fontSize: '12px', padding: '16px', borderRadius: '2px' }}
            >
              SUIVANT →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="font-jost" style={labelStyle}>
                VOTRE VÉHICULE
              </label>
              <p className="font-jost font-light" style={helperStyle}>
                Donnez-nous simplement le nom du véhicule.
              </p>
              <input
                type="text"
                value={vehicleName}
                onChange={e => { setVehicleName(e.target.value); if (errors.vehicleName) setErrors(prev => { const n = { ...prev }; delete n.vehicleName; return n; }); }}
                placeholder="Ex : Toyota Camry, Mercedes Classe C..."
                className={inputStyle}
                style={{ borderRadius: '2px' }}
              />
              {errors.vehicleName && <p className="font-jost font-light" style={errorStyle}>{errors.vehicleName}</p>}
            </div>
            <div>
              <label className="font-jost" style={labelStyle}>
                VOTRE PRIX SOUHAITÉ
              </label>
              <p className="font-jost font-light" style={helperStyle}>
                Donnez nous votre prix de vente.
              </p>
              <input
                type="text"
                value={askingPrice}
                onChange={e => setAskingPrice(e.target.value)}
                placeholder="Laissez vide si vous n'avez pas encore un montant exact en tête"
                className={inputStyle}
                style={{ borderRadius: '2px' }}
              />
            </div>
            <button
              onClick={goNext}
              className="w-full bg-vd-black text-white font-jost uppercase font-light transition-colors duration-200 hover:bg-gray-800"
              style={{ letterSpacing: '0.15em', fontSize: '12px', padding: '16px', borderRadius: '2px' }}
            >
              ENVOYER MA DEMANDE →
            </button>
            <button
              onClick={goBack}
              className="w-full bg-transparent font-jost uppercase font-light transition-colors duration-200 hover:bg-vd-surface"
              style={{ color: '#9A9A9A', border: '1px solid #E0E0E0', letterSpacing: '0.15em', fontSize: '12px', padding: '14px', borderRadius: '2px' }}
            >
              ← RETOUR
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div
            className="text-center transition-opacity duration-400"
            style={{ opacity: fadeIn ? 1 : 0 }}
          >
            <p className="font-jost uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}>
              REÇU
            </p>
            <h2 className="font-cormorant font-light text-vd-text mt-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Merci, Mr/Mme {prenom}.
            </h2>
            <div className="mx-auto my-6" style={{ width: '60px', height: '1px', background: '#E0E0E0' }} />
            <p className="font-jost font-light" style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: '1.9' }}>
              Nous avons bien reçu vos informations. Nous vous contacterons très prochainement pour discuter de la vente de votre véhicule.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
