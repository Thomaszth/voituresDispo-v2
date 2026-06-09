import { useState } from 'react';
import { findCountryByCode } from '../data/countries';
import { CountrySelector } from './CountrySelector';
import { validatePhoneNumber } from '../utils/validatePhone';

interface FormFields {
  nom: string;
  telephone: string;
  countryCode: string;
  vehicule: string;
  budget: string;
}

interface FormErrors {
  nom?: string;
  telephone?: string;
  vehicule?: string;
}

interface VehicleRequestFormProps {
  searchQuery: string;
  onReturnToCatalogue: () => void;
}

export function VehicleRequestForm({ searchQuery, onReturnToCatalogue }: VehicleRequestFormProps) {
  const [fields, setFields] = useState<FormFields>({
    nom: '',
    telephone: '',
    countryCode: 'BJ',
    vehicule: searchQuery,
    budget: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof FormFields, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fields.nom.trim()) {
      newErrors.nom = 'Ce champ est obligatoire.';
    } else if (/^\d+$/.test(fields.nom.trim())) {
      newErrors.nom = 'Veuillez entrer un nom valide.';
    }

    if (!fields.telephone.trim()) {
      newErrors.telephone = 'Ce champ est obligatoire.';
    } else if (!validatePhoneNumber(fields.telephone, fields.countryCode)) {
      newErrors.telephone = 'Veuillez entrer un numéro valide.';
    }

    if (!fields.vehicule.trim()) {
      newErrors.vehicule = 'Ce champ est obligatoire.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendTelegramMessage = async () => {
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID as string;
    const MESSAGE_THREAD_ID = Number(import.meta.env.VITE_TELEGRAM_THREAD_ID);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} à ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const budget = fields.budget.trim() || 'Non renseigné';

    const text =
      `*Nouvelle demande de véhicule*\n\n` +
      `*Nom :* ${fields.nom}\n` +
      `*Téléphone :* ${findCountryByCode(fields.countryCode)?.callingCode}${fields.telephone}\n` +
      `*Véhicule recherché :* ${fields.vehicule}\n` +
      `*Budget :* ${budget}\n\n` +
      `*Statut :* En attente\n` +
      `*Reçue le :* ${dateStr}`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          message_thread_id: MESSAGE_THREAD_ID,
          parse_mode: 'Markdown',
          text,
        }),
      });
    } catch {
      // silently ignored
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    sendTelegramMessage();
  };

  const prenom = fields.nom.trim().split(/\s+/)[0] || '';

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <h2 className="font-cormorant font-light text-vd-text mt-6 text-[clamp(28px,5vw,44px)] tracking-wide">
          Demande envoyée
        </h2>
        <div className="h-px bg-vd-border mt-6 w-15" />
        <p className="font-jost font-light text-vd-meta mt-6 max-w-md text-sm leading-relaxed">
          Merci {prenom}. Nous reviendrons vers vous dès que nous aurons trouvé votre véhicule.
        </p>
        <button
          onClick={onReturnToCatalogue}
          className="w-full max-w-md bg-vd-black text-white font-jost font-light uppercase py-4 mt-8 transition-colors duration-200 hover:bg-gray-800 text-xs tracking-widest"
        >
          RETOUR AU CATALOGUE
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-16 px-5 md:px-8">
      <h2 className="font-cormorant font-light text-vd-text mt-6 text-[clamp(28px,5vw,44px)] tracking-wide">
        Nous n'avons pas ce véhicule actuellement.
      </h2>
      <div className="h-px bg-vd-border mt-6 w-15" />
      <p className="font-jost font-light text-vd-meta mt-6 max-w-md text-sm leading-relaxed">
        Veuillez bien nous laissez vos coordonnées et nous vous contacterons dès que nous aurons des propositions.
      </p>

      <div className="w-full max-w-md mt-10 text-left flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="font-jost font-light text-vd-meta uppercase text-label tracking-widest">
            Prénom et nom <span className="text-vd-text">*</span>
          </label>
          <input
            type="text"
            value={fields.nom}
            onChange={e => handleChange('nom', e.target.value)}
            className="w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 text-sm focus:outline-none focus:border-vd-text transition-colors duration-200"
          />
          {errors.nom && (
            <p className="font-jost font-light text-vd-caption text-cta">
              {errors.nom}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-jost font-light text-vd-meta uppercase text-label tracking-widest">
            Numéro de téléphone <span className="text-vd-text">*</span>
          </label>
          <div className="flex gap-3">
            <CountrySelector
              value={fields.countryCode}
              onChange={code => handleChange('countryCode', code)}
            />
            <input
              type="tel"
              value={fields.telephone}
              onChange={e => handleChange('telephone', e.target.value)}
              placeholder="Votre numéro"
              className="flex-1 border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 text-sm focus:outline-none focus:border-vd-text transition-colors duration-200"
            />
          </div>
          {errors.telephone && (
            <p className="font-jost font-light text-vd-caption text-cta">
              {errors.telephone}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-jost font-light text-vd-meta uppercase text-label tracking-widest">
            Le véhicule que vous recherchez <span className="text-vd-text">*</span>
          </label>
          <textarea
            value={fields.vehicule}
            onChange={e => handleChange('vehicule', e.target.value)}
            rows={3}
            className="w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 text-sm resize-none focus:outline-none focus:border-vd-text transition-colors duration-200"
          />
          {errors.vehicule && (
            <p className="font-jost font-light text-vd-caption text-cta">
              {errors.vehicule}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-jost font-light text-vd-meta uppercase text-label tracking-widest">
            Votre budget approximatif
          </label>
          <input
            type="text"
            value={fields.budget}
            onChange={e => handleChange('budget', e.target.value)}
            className="w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 text-sm focus:outline-none focus:border-vd-text transition-colors duration-200"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-vd-black text-white font-jost font-light uppercase py-4 mt-2 transition-colors duration-200 hover:bg-gray-800 text-xs tracking-widest"
        >
          ENVOYER MA DEMANDE
        </button>

        <p className="font-jost font-light text-vd-caption text-center text-xs">
          Nous vous contacterons dès que possible.
        </p>
      </div>
    </div>
  );
}
