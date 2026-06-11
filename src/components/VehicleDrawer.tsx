import { useState, useEffect, useRef, useCallback } from 'react';
import { X, GripVertical } from 'lucide-react';
import { VoitureDB } from '../types/voitureDB';
import { formatPrice } from '../utils/formatPrice';
import { supabase } from '../lib/supabase';
import { notifyVoituresChanged } from '../hooks/useVoitures';

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

type FuelType = 'Essence' | 'Diesel' | 'Électrique' | 'Hybride';
type Transmission = 'Automatique' | 'Manuelle';
type WarrantyOption = 'oui' | 'non' | 'non_renseigne';

interface FormState {
  make: string;
  model: string;
  year: string;
  licence_plate_letters: string;
  color: string;
  status: 'available' | 'sold';
  description: string;
  mileage: string;
  fuel_type: FuelType;
  fuel_consumption: string;
  transmission: Transmission;
  motor_type: string;
  vehicle_location: string;
  dealer_purchased: boolean;
  warranty_option: WarrantyOption;
  warranty_details: string;
  owner_asking_price: string;
  service_fee: string;
  images: string[];
}

function warrantyOptionFromDB(v: VoitureDB): WarrantyOption {
  if (v.under_warranty === null) return 'non_renseigne';
  return v.under_warranty ? 'oui' : 'non';
}

function mileageStringToNumber(s: string): string {
  return s.replace(/\s/g, '').replace('km', '').trim();
}

function numberToMileageString(n: string): string {
  const num = parseInt(n.replace(/\D/g, ''), 10);
  if (isNaN(num)) return n;
  return new Intl.NumberFormat('fr-FR').format(num) + ' km';
}

function addCloudinaryOptimization(url: string): string {
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/q_auto')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
}

interface VehicleDrawerProps {
  open: boolean;
  onClose: () => void;
  editing: VoitureDB | null;
}

const EMPTY_FORM: FormState = {
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  licence_plate_letters: '',
  color: '',
  status: 'available',
  description: '',
  mileage: '',
  fuel_type: 'Essence',
  fuel_consumption: '',
  transmission: 'Automatique',
  motor_type: '',
  vehicle_location: '',
  dealer_purchased: false,
  warranty_option: 'non_renseigne',
  warranty_details: '',
  owner_asking_price: '',
  service_fee: '',
  images: [],
};

function voitureToForm(v: VoitureDB): FormState {
  return {
    make: v.make,
    model: v.model,
    year: String(v.year),
    licence_plate_letters: v.licence_plate_letters,
    color: v.color,
    status: v.status,
    description: v.description,
    mileage: mileageStringToNumber(v.mileage),
    fuel_type: v.fuel_type,
    fuel_consumption: v.fuel_consumption,
    transmission: v.transmission,
    motor_type: v.motor_type,
    vehicle_location: v.vehicle_location,
    dealer_purchased: v.dealer_purchased,
    warranty_option: warrantyOptionFromDB(v),
    warranty_details: v.warranty_details ?? '',
    owner_asking_price: String(v.owner_asking_price),
    service_fee: String(v.service_fee),
    images: v.images,
  };
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function VehicleDrawer({ open, onClose, editing }: VehicleDrawerProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const widgetRef = useRef<ReturnType<typeof window.cloudinary.createUploadWidget> | null>(null);

  useEffect(() => {
    if (open) {
      setForm(editing ? voitureToForm(editing) : EMPTY_FORM);
    }
  }, [open, editing]);

  const set = (field: keyof FormState, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const totalPrice =
    (parseInt(form.owner_asking_price) || 0) + (parseInt(form.service_fee) || 0);

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
          multiple: true,
          maxFiles: 10,
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
            setForm(prev => ({ ...prev, images: [...prev.images, url] }));
          }
        }
      );
    }
    widgetRef.current.open();
  };

  const removeImage = (idx: number) =>
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverIdx(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    setForm(prev => {
      const updated = [...prev.images];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(targetIdx, 0, moved);
      return { ...prev, images: updated };
    });
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  const handleSave = async () => {
    console.log('ENREGISTRER cliqué');
    if (!form.make.trim() || !form.model.trim()) return;
    setSaving(true);

    const payload: Omit<VoitureDB, 'created_at'> = {
      id: editing?.id ?? String(Date.now()),
      make: form.make.trim(),
      model: form.model.trim(),
      year: parseInt(form.year) || new Date().getFullYear(),
      owner_asking_price: parseInt(form.owner_asking_price) || 0,
      service_fee: parseInt(form.service_fee) || 0,
      mileage: numberToMileageString(form.mileage),
      color: form.color.trim(),
      fuel_type: form.fuel_type,
      licence_plate_letters: form.licence_plate_letters.trim(),
      fuel_consumption: form.fuel_consumption.trim(),
      transmission: form.transmission,
      motor_type: form.motor_type.trim(),
      vehicle_location: form.vehicle_location.trim(),
      dealer_purchased: form.dealer_purchased,
      under_warranty: form.warranty_option === 'non_renseigne' ? null : form.warranty_option === 'oui',
      warranty_details: form.warranty_option === 'oui' ? form.warranty_details.trim() : null,
      status: form.status,
      description: form.description.trim(),
      images: form.images,
      // Date.now() overflows Postgres integer — use a small sequential int instead
      sort_order: editing?.sort_order ?? Math.floor(Date.now() / 1000),
    };

    console.log('Payload envoyé à Supabase:', payload);

    if (editing) {
      const { error } = await supabase
        .from('voitures')
        .update(payload)
        .eq('id', editing.id)
        .select();
      if (error) {
        console.error('Supabase update error:', error);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('voitures')
        .insert(payload)
        .select();
      if (error) {
        console.error('Supabase insert error:', error);
        setSaving(false);
        return;
      }
      console.log('Véhicule inséré:', data);
    }

    setSaving(false);
    notifyVoituresChanged();
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
        className={`fixed z-50 bg-white overflow-y-auto transition-transform duration-300 ease-in-out
          inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[480px] md:border-l md:border-vd-border
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={!open ? { transform: 'translateX(100%)' } : undefined}
      >
        <div className="border-b border-vd-border md:hidden border-t" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-vd-border sticky top-0 bg-white z-10">
          <p className="font-jost font-light uppercase text-vd-text text-xs tracking-[0.15em]">
            {editing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
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
          <SectionHeader title="Informations générales" />

          <div className="flex flex-col gap-4">
            <Field label="Marque">
              <input className={inputClass} value={form.make} onChange={e => set('make', e.target.value)} />
            </Field>
            <Field label="Modèle">
              <input className={inputClass} value={form.model} onChange={e => set('model', e.target.value)} />
            </Field>
            <Field label="Année">
              <input type="number" className={inputClass} value={form.year} onChange={e => set('year', e.target.value)} />
            </Field>
            <Field label="Série / Immatriculation">
              <input className={inputClass} value={form.licence_plate_letters} onChange={e => set('licence_plate_letters', e.target.value)} />
            </Field>
            <Field label="Couleur">
              <input className={inputClass} value={form.color} onChange={e => set('color', e.target.value)} />
            </Field>
            <Field label="Statut">
              <select className={selectClass} value={form.status} onChange={e => set('status', e.target.value as 'available' | 'sold')}>
                <option value="available">Disponible</option>
                <option value="sold">Vendu</option>
              </select>
            </Field>
            <Field label="Description">
              <textarea
                rows={4}
                className={`${inputClass} resize-none`}
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </Field>
          </div>

          <SectionHeader title="Caractéristiques techniques" />

          <div className="flex flex-col gap-4">
            <Field label="Kilométrage (km)">
              <input
                type="number"
                className={inputClass}
                value={form.mileage}
                onChange={e => set('mileage', e.target.value)}
                placeholder="ex : 12000"
              />
            </Field>
            <Field label="Carburant">
              <select className={selectClass} value={form.fuel_type} onChange={e => set('fuel_type', e.target.value as FuelType)}>
                <option value="Essence">Essence</option>
                <option value="Diesel">Diesel</option>
                <option value="Électrique">Électrique</option>
                <option value="Hybride">Hybride</option>
              </select>
            </Field>
            <Field label="Consommation">
              <input
                className={inputClass}
                value={form.fuel_consumption}
                onChange={e => set('fuel_consumption', e.target.value)}
                placeholder="ex : 7.5L / 100km"
              />
            </Field>
            <Field label="Transmission">
              <select className={selectClass} value={form.transmission} onChange={e => set('transmission', e.target.value as Transmission)}>
                <option value="Automatique">Automatique</option>
                <option value="Manuelle">Manuelle</option>
              </select>
            </Field>
            <Field label="Motorisation">
              <input
                className={inputClass}
                value={form.motor_type}
                onChange={e => set('motor_type', e.target.value)}
                placeholder="ex : V6, V8, 4 cylindres"
              />
            </Field>
          </div>

          <SectionHeader title="Informations commerciales" />

          <div className="flex flex-col gap-4">
            <Field label="Localisation du véhicule">
              <input className={inputClass} value={form.vehicle_location} onChange={e => set('vehicle_location', e.target.value)} />
            </Field>

            <div className="flex items-center justify-between py-2">
              <span className={labelClass}>Acheté chez un concessionnaire</span>
              <button
                type="button"
                onClick={() => set('dealer_purchased', !form.dealer_purchased)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  form.dealer_purchased ? 'bg-vd-black' : 'bg-vd-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    form.dealer_purchased ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <Field label="Sous garantie">
              <select
                className={selectClass}
                value={form.warranty_option}
                onChange={e => set('warranty_option', e.target.value as WarrantyOption)}
              >
                <option value="non_renseigne">Non renseigné</option>
                <option value="oui">Oui</option>
                <option value="non">Non</option>
              </select>
            </Field>

            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                form.warranty_option === 'oui' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <Field label="Détails de la garantie">
                <input
                  className={inputClass}
                  value={form.warranty_details}
                  onChange={e => set('warranty_details', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Prix demandé par le propriétaire (FCFA)">
              <input
                type="number"
                className={inputClass}
                value={form.owner_asking_price}
                onChange={e => set('owner_asking_price', e.target.value)}
              />
            </Field>
            <Field label="Frais de service Voitures Dispo (FCFA)">
              <input
                type="number"
                className={inputClass}
                value={form.service_fee}
                onChange={e => set('service_fee', e.target.value)}
              />
            </Field>

            <div className="flex justify-between items-center py-3 border-b border-vd-border">
              <span className="font-jost font-light text-vd-meta text-sm uppercase tracking-[0.1em]">
                Prix total affiché
              </span>
              <span className="font-jost font-semibold text-vd-text text-base">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          <SectionHeader title="Photos" />

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={openCloudinary}
              className="w-full bg-vd-black text-white font-jost uppercase font-light py-3 text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800"
            >
              AJOUTER DES PHOTOS
            </button>

            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, idx) => (
                  <div
                    key={`${idx}-${url}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-sm ${
                      dragIdx === idx ? 'opacity-40' : ''
                    } ${dragIdx !== null && dragIdx !== idx ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={overIdx === idx && dragIdx !== null ? { border: '2px solid #0A0A0A' } : undefined}
                  >
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover rounded-sm"
                    />
                    <GripVertical
                      size={14}
                      style={{ color: '#FFFFFF' }}
                      className="absolute top-0.5 left-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-vd-black text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700 transition-colors duration-150"
                      aria-label="Supprimer la photo"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
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
