import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { PalmaresDB } from '../types/palmares';
import { supabase } from '../lib/supabase';
import { notifyPalmaresChanged } from '../hooks/usePalmares';

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info: { secure_url: string } }) => void
      ) => { open: () => void };
    };
  }
}

interface FormState {
  car_name: string;
  photo: string;
  owner_asking_price: string;
  final_sale_price: string;
  days_to_sell: string;
  comment: string;
}

interface FormErrors {
  car_name?: string;
  photo?: string;
  owner_asking_price?: string;
  final_sale_price?: string;
  days_to_sell?: string;
}

const EMPTY_FORM: FormState = {
  car_name: '',
  photo: '',
  owner_asking_price: '',
  final_sale_price: '',
  days_to_sell: '',
  comment: '',
};

function palmaresToForm(v: PalmaresDB): FormState {
  return {
    car_name: v.car_name,
    photo: v.photo,
    owner_asking_price: String(v.owner_asking_price),
    final_sale_price: String(v.final_sale_price),
    days_to_sell: String(v.days_to_sell),
    comment: v.comment ?? '',
  };
}

function addCloudinaryOptimization(url: string): string {
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/q_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
}

const inputClass =
  'w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 text-sm focus:outline-none focus:border-vd-text transition-colors duration-200';
const labelClass =
  'font-jost font-light text-vd-meta uppercase text-label tracking-widest block mb-1';

interface PalmaresDrawerProps {
  open: boolean;
  onClose: () => void;
  editing: PalmaresDB | null;
}

export function PalmaresDrawer({ open, onClose, editing }: PalmaresDrawerProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const widgetRef = useRef<ReturnType<typeof window.cloudinary.createUploadWidget> | null>(null);

  useEffect(() => {
    if (open) {
      setForm(editing ? palmaresToForm(editing) : EMPTY_FORM);
      setErrors({});
    }
  }, [open, editing]);

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME as string;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET as string;

  const openCloudinary = () => {
    if (!window.cloudinary) return;
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          sources: ['local', 'camera'],
          multiple: false,
          maxFiles: 1,
          language: 'fr',
          styles: {
            palette: {
              window: '#1A1A1A',
              windowBorder: '#333333',
              tabIcon: '#FFFFFF',
              menuIcons: '#CCCCCC',
              textDark: '#FFFFFF',
              textLight: '#0A0A0A',
              link: '#FFFFFF',
              action: '#FFFFFF',
              inactiveTabIcon: '#888888',
              error: '#CC0000',
              inProgress: '#FFFFFF',
              complete: '#33CC66',
              sourceBg: '#0A0A0A',
            },
          },
        },
        (_error, result) => {
          if (result.event === 'success') {
            const url = addCloudinaryOptimization(result.info.secure_url);
            set('photo', url);
          }
        }
      );
    }
    widgetRef.current.open();
  };

  const removePhoto = () => set('photo', '');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.car_name.trim()) newErrors.car_name = 'Le nom du véhicule est obligatoire.';
    if (!form.photo) newErrors.photo = 'Une photo est obligatoire.';
    if (!form.owner_asking_price.trim()) newErrors.owner_asking_price = 'Le prix demandé est obligatoire.';
    if (!form.final_sale_price.trim()) newErrors.final_sale_price = 'Le prix de vente est obligatoire.';
    if (!form.days_to_sell.trim()) newErrors.days_to_sell = 'Le nombre de jours est obligatoire.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      car_name: form.car_name.trim(),
      photo: form.photo,
      owner_asking_price: parseInt(form.owner_asking_price) || 0,
      final_sale_price: parseInt(form.final_sale_price) || 0,
      days_to_sell: parseInt(form.days_to_sell) || 0,
      comment: form.comment.trim() || null,
    };

    if (editing) {
      const { error } = await supabase
        .from('palmares')
        .update(payload)
        .eq('id', editing.id);
      if (error) {
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('palmares')
        .insert(payload);
      if (error) {
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    notifyPalmaresChanged();
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:bg-black/30"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed z-50 bg-white overflow-y-auto transition-transform ease-in-out
          inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[480px] md:border-l md:border-vd-border
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionDuration: '250ms', ...(!open ? { transform: 'translateX(100%)' } : {}) }}
      >
        <div className="border-b border-vd-border md:hidden border-t" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-vd-border sticky top-0 bg-white z-10">
          <p className="font-jost font-light uppercase text-vd-text text-xs tracking-[0.15em]">
            {editing ? 'Modifier la vente' : 'Ajouter une vente'}
          </p>
          <button
            onClick={onClose}
            className="text-vd-meta hover:text-vd-text transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-8">
          <div className="flex flex-col gap-4 mt-6">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Nom du véhicule</label>
              <input
                className={inputClass}
                value={form.car_name}
                onChange={e => set('car_name', e.target.value)}
                placeholder="Ex : Toyota Camry 2018"
              />
              {errors.car_name && (
                <p className="font-jost font-light text-xs text-red-500 mt-1">{errors.car_name}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Photo</label>
              <button
                type="button"
                onClick={openCloudinary}
                className="w-full bg-vd-black text-white font-jost uppercase font-light py-3 text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800"
              >
                AJOUTER UNE PHOTO
              </button>
              {form.photo && (
                <div className="relative mt-2 w-[120px] h-[80px] rounded-sm overflow-hidden border border-[#E0E0E0]">
                  <img
                    src={form.photo}
                    alt="Photo du véhicule"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-vd-black text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700 transition-colors duration-150"
                    aria-label="Supprimer la photo"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              {errors.photo && (
                <p className="font-jost font-light text-xs text-red-500 mt-1">{errors.photo}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Prix demandé par le propriétaire (FCFA)</label>
              <input
                type="number"
                className={inputClass}
                value={form.owner_asking_price}
                onChange={e => set('owner_asking_price', e.target.value)}
              />
              {errors.owner_asking_price && (
                <p className="font-jost font-light text-xs text-red-500 mt-1">{errors.owner_asking_price}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Prix de vente final (FCFA)</label>
              <input
                type="number"
                className={inputClass}
                value={form.final_sale_price}
                onChange={e => set('final_sale_price', e.target.value)}
              />
              {errors.final_sale_price && (
                <p className="font-jost font-light text-xs text-red-500 mt-1">{errors.final_sale_price}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Nombre de jours pour vendre</label>
              <input
                type="number"
                className={inputClass}
                value={form.days_to_sell}
                onChange={e => set('days_to_sell', e.target.value)}
                placeholder="Ex : 14"
              />
              {errors.days_to_sell && (
                <p className="font-jost font-light text-xs text-red-500 mt-1">{errors.days_to_sell}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Commentaire</label>
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={form.comment}
                onChange={e => set('comment', e.target.value)}
                placeholder="Ex : Vendu en 11 jours au prix souhaité."
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-vd-black text-white font-jost uppercase font-light py-4 text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="font-jost font-light text-vd-meta text-xs text-center w-full py-2 hover:text-vd-text transition-colors duration-200"
            >
              ANNULER
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
