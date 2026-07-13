import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyRecherchesAdminChanged } from '../hooks/useRecherchesAdmin';
import { notifyRecherchesChanged } from '../hooks/useRecherches';
import type { RechercheAdminDB } from '../hooks/useRecherchesAdmin';

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
  specifics: string;
  budget_note: string;
  status: 'active' | 'trouve';
  photo: string;
}

interface FormErrors {
  car_name?: string;
  specifics?: string;
}

const EMPTY_FORM: FormState = {
  car_name: '',
  specifics: '',
  budget_note: '',
  status: 'active',
  photo: '',
};

function entryToForm(entry: RechercheAdminDB): FormState {
  return {
    car_name: entry.car_name,
    specifics: entry.specifics,
    budget_note: entry.budget_note ?? '',
    status: entry.status === 'trouve' ? 'trouve' : 'active',
    photo: entry.photo ?? '',
  };
}

function addCloudinaryOptimization(url: string): string {
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/q_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
}

const inputClass =
  'w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 text-sm focus:outline-none focus:border-vd-text transition-colors duration-200';
const selectClass =
  'w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 text-sm focus:outline-none focus:border-vd-text transition-colors duration-200 cursor-pointer appearance-none';
const labelClass =
  'font-jost font-light text-vd-meta uppercase text-label tracking-widest block mb-1';

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 mt-6">
      <p className="font-jost uppercase font-light text-vd-caption text-[10px] tracking-[0.2em] mb-2">
        {title}
      </p>
      <div className="border-t border-vd-border" />
    </div>
  );
}

interface RechercheDrawerProps {
  open: boolean;
  onClose: () => void;
  editing: RechercheAdminDB | null;
}

export function RechercheDrawer({ open, onClose, editing }: RechercheDrawerProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const widgetRef = useRef<ReturnType<typeof window.cloudinary.createUploadWidget> | null>(null);

  useEffect(() => {
    if (open) {
      setForm(editing ? entryToForm(editing) : EMPTY_FORM);
      setErrors({});
    }
  }, [open, editing]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
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
    if (!form.car_name.trim()) newErrors.car_name = 'Ce champ est obligatoire.';
    if (!form.specifics.trim()) newErrors.specifics = 'Ce champ est obligatoire.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      car_name: form.car_name.trim(),
      specifics: form.specifics.trim(),
      budget_note: form.budget_note.trim() || null,
      status: form.status,
      photo: form.photo || null,
    };

    if (editing) {
      const { error } = await supabase
        .from('recherches')
        .update(payload)
        .eq('id', editing.id);
      if (error) {
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('recherches')
        .insert(payload);
      if (error) {
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    notifyRecherchesAdminChanged();
    notifyRecherchesChanged();
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
        className={`fixed z-50 bg-white overflow-y-auto
          inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[480px] md:border-l md:border-vd-border
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionProperty: 'transform', transitionDuration: '250ms', transitionTimingFunction: 'ease', ...(!open ? { transform: 'translateX(100%)' } : {}) }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-vd-border sticky top-0 bg-white z-10">
          <p className="font-jost font-light uppercase text-vd-text text-xs tracking-[0.15em]">
            {editing ? 'Modifier la recherche' : 'Ajouter une recherche'}
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
          <SectionHeader title="INFORMATIONS" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>NOM DU VÉHICULE</label>
              <input
                className={inputClass}
                value={form.car_name}
                onChange={e => {
                  set('car_name', e.target.value);
                  if (errors.car_name) setErrors(prev => ({ ...prev, car_name: undefined }));
                }}
                placeholder="Ex : Toyota Land Cruiser 200"
              />
              {errors.car_name && (
                <p className="font-jost font-light text-xs text-red-500 mt-1">{errors.car_name}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>SPÉCIFICATIONS</label>
              <p className="font-jost font-light text-[11px] mb-1" style={{ color: '#9A9A9A' }}>
                Soyez précis — c'est ce que les vendeurs potentiels verront.
              </p>
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={form.specifics}
                onChange={e => {
                  set('specifics', e.target.value);
                  if (errors.specifics) setErrors(prev => ({ ...prev, specifics: undefined }));
                }}
                placeholder="Ex : Année 2018–2020, boîte automatique, full options"
              />
              {errors.specifics && (
                <p className="font-jost font-light text-xs text-red-500 mt-1">{errors.specifics}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>NOTE (OPTIONNEL)</label>
              <input
                className={inputClass}
                value={form.budget_note}
                onChange={e => set('budget_note', e.target.value)}
                placeholder="Ex : Budget client : 25M FCFA"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>STATUT</label>
              <select
                className={selectClass}
                value={form.status}
                onChange={e => set('status', e.target.value as 'active' | 'trouve')}
              >
                <option value="active">Active</option>
                <option value="trouve">Trouvé</option>
              </select>
            </div>
          </div>

          <SectionHeader title="PHOTO (OPTIONNELLE)" />

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={openCloudinary}
              className="w-full bg-vd-black text-white font-jost uppercase font-light py-3 text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800"
            >
              AJOUTER UNE PHOTO
            </button>
            {form.photo && (
              <div className="relative mt-1" style={{ width: '120px', height: '80px' }}>
                <img
                  src={form.photo}
                  alt="Photo"
                  className="w-full h-full object-cover rounded-sm"
                  style={{ border: '1px solid #E0E0E0', borderRadius: '2px' }}
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
