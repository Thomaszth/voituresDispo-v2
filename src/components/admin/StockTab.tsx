import { useState, ReactNode } from 'react';
import { VoitureDB } from '../../types/voitureDB';
import { formatPrice } from '../../utils/formatPrice';
import { supabase } from '../../lib/supabase';
import { VehicleDrawer } from '../VehicleDrawer';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import { useVoitures, notifyVoituresChanged } from '../../hooks/useVoitures';
import { AdminEntityTable } from './AdminEntityTable';

const ACTION_BTN =
  'font-jost font-light text-xs text-vd-meta hover:text-vd-text underline-offset-2 hover:underline transition-colors duration-150 cursor-pointer bg-transparent border-none p-0';

const COLUMNS = [
  { key: 'photo', header: 'Photo' },
  { key: 'vehicle', header: 'Véhicule' },
  { key: 'price', header: 'Prix total' },
  { key: 'status', header: 'Statut' },
  { key: 'actions', header: 'Actions' },
];

export function StockTab() {
  const { voitures, loading } = useVoitures();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<VoitureDB | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VoitureDB | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (car: VoitureDB) => {
    setEditing(car);
    setDrawerOpen(true);
  };

  const toggleStatus = async (car: VoitureDB) => {
    const newStatus = car.status === 'available' ? 'sold' : 'available';
    await supabase.from('voitures').update({ status: newStatus }).eq('id', car.id);
    notifyVoituresChanged();
  };

  const copyLink = async (car: VoitureDB) => {
    const url = `${window.location.origin}/voitures/${car.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(car.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback silently
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await supabase.from('voitures').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    notifyVoituresChanged();
  };

  const rows = voitures.map(car => ({
    id: car.id,
    photo: car.images[0] ?? null,
    photoAlt: `${car.make} ${car.model}`,
    item: car,
  }));

  const renderCell = (car: VoitureDB, columnKey: string): ReactNode => {
    switch (columnKey) {
      case 'vehicle':
        return (
          <p className="font-jost font-[400] text-vd-text text-sm whitespace-nowrap">
            {car.year} {car.make} {car.model}
          </p>
        );
      case 'price':
        return (
          <p className="font-jost font-light text-vd-text text-sm whitespace-nowrap">
            {formatPrice(car.owner_asking_price + car.service_fee)}
          </p>
        );
      case 'status':
        return (
          <p className="font-jost font-light text-vd-meta text-sm">
            {car.status === 'available' ? 'Disponible' : 'Vendu'}
          </p>
        );
      default:
        return null;
    }
  };

  const renderMobileCardContent = (car: VoitureDB): ReactNode => (
    <>
      <p className="font-jost font-[400] text-vd-text text-sm">
        {car.year} {car.make} {car.model}
      </p>
      <p className="font-jost font-light text-vd-text text-sm mt-1">
        {formatPrice(car.owner_asking_price + car.service_fee)}
      </p>
      <p className="font-jost font-light text-vd-meta text-xs mt-1">
        {car.status === 'available' ? 'Disponible' : 'Vendu'}
      </p>
    </>
  );

  const renderDesktopActions = (car: VoitureDB): ReactNode => (
    <>
      <button className={ACTION_BTN} onClick={() => openEdit(car)}>
        Modifier
      </button>
      <button className={ACTION_BTN} onClick={() => toggleStatus(car)}>
        Changer le statut
      </button>
      <button className={ACTION_BTN} onClick={() => copyLink(car)}>
        {copiedId === car.id ? (
          <span className="text-vd-text">Copié !</span>
        ) : (
          'Copier le lien'
        )}
      </button>
      <button
        className={`${ACTION_BTN} hover:!text-vd-text`}
        onClick={() => setDeleteTarget(car)}
      >
        Supprimer
      </button>
    </>
  );

  const renderMobileActions = (car: VoitureDB): ReactNode => (
    <>
      <button
        onClick={() => openEdit(car)}
        className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
      >
        Modifier
      </button>
      <button
        onClick={() => toggleStatus(car)}
        className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
      >
        Changer le statut
      </button>
      <button
        onClick={() => copyLink(car)}
        className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
      >
        {copiedId === car.id ? 'Copié !' : 'Copier le lien'}
      </button>
      <button
        onClick={() => setDeleteTarget(car)}
        className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface hover:text-vd-text transition-colors duration-150"
      >
        Supprimer
      </button>
    </>
  );

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-vd-border">
        <p className="font-jost font-[400] uppercase text-vd-text text-[13px] tracking-[0.2em]">
          Voitures Dispo — Gestion du Stock
        </p>
        <button
          onClick={openAdd}
          className="w-full md:w-auto bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] px-6 py-3 transition-colors duration-200 hover:bg-gray-800"
        >
          AJOUTER UN VÉHICULE +
        </button>
      </div>

      <AdminEntityTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        emptyMessage="Aucun véhicule."
        renderCell={renderCell}
        renderMobileCardContent={renderMobileCardContent}
        renderDesktopActions={renderDesktopActions}
        renderMobileActions={renderMobileActions}
      />

      <VehicleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
