import { useState, ReactNode } from 'react';
import { PalmaresDB } from '../../types/palmares';
import { formatPrice } from '../../utils/formatPrice';
import { supabase } from '../../lib/supabase';
import { PalmaresDrawer } from '../PalmaresDrawer';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import { usePalmares, notifyPalmaresChanged } from '../../hooks/usePalmares';
import { AdminEntityTable } from './AdminEntityTable';

const ACTION_BTN =
  'font-jost font-light text-xs text-vd-meta hover:text-vd-text underline-offset-2 hover:underline transition-colors duration-150 cursor-pointer bg-transparent border-none p-0';

const COLUMNS = [
  { key: 'photo', header: 'Photo' },
  { key: 'vehicle', header: 'Véhicule' },
  { key: 'askingPrice', header: 'Prix demandé' },
  { key: 'salePrice', header: 'Prix de vente' },
  { key: 'days', header: 'Jours' },
  { key: 'actions', header: 'Actions' },
];

export function PalmaresTab() {
  const { palmares, loading } = usePalmares();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PalmaresDB | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PalmaresDB | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (entry: PalmaresDB) => {
    setEditing(entry);
    setDrawerOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await supabase.from('palmares').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    notifyPalmaresChanged();
  };

  const rows = palmares.map(entry => ({
    id: entry.id,
    photo: entry.photo ?? null,
    photoAlt: entry.car_name,
    item: entry,
  }));

  const renderCell = (entry: PalmaresDB, columnKey: string): ReactNode => {
    switch (columnKey) {
      case 'vehicle':
        return (
          <p className="font-jost font-[400] text-vd-text text-sm whitespace-nowrap">
            {entry.car_name}
          </p>
        );
      case 'askingPrice':
        return (
          <p className="font-jost font-light text-vd-text text-sm whitespace-nowrap">
            {formatPrice(Number(entry.owner_asking_price))}
          </p>
        );
      case 'salePrice':
        return (
          <p className="font-jost font-light text-vd-text text-sm whitespace-nowrap">
            {formatPrice(Number(entry.final_sale_price))}
          </p>
        );
      case 'days':
        return (
          <p className="font-jost font-light text-vd-text text-sm whitespace-nowrap">
            {entry.days_to_sell} j
          </p>
        );
      default:
        return null;
    }
  };

  const renderMobileCardContent = (entry: PalmaresDB): ReactNode => (
    <>
      <p className="font-jost font-[400] text-vd-text text-sm">
        {entry.car_name}
      </p>
      <p className="font-jost font-light text-vd-text text-sm mt-1">
        {formatPrice(Number(entry.owner_asking_price))}
      </p>
      <p className="font-jost font-light text-vd-text text-sm mt-1">
        {formatPrice(Number(entry.final_sale_price))}
      </p>
      <p className="font-jost font-light text-vd-meta text-xs mt-1">
        {entry.days_to_sell} j
      </p>
    </>
  );

  const renderDesktopActions = (entry: PalmaresDB): ReactNode => (
    <>
      <button className={ACTION_BTN} onClick={() => openEdit(entry)}>
        Modifier
      </button>
      <button
        className={`${ACTION_BTN} hover:!text-vd-text`}
        onClick={() => setDeleteTarget(entry)}
      >
        Supprimer
      </button>
    </>
  );

  const renderMobileActions = (entry: PalmaresDB): ReactNode => (
    <>
      <button
        onClick={() => openEdit(entry)}
        className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
      >
        Modifier
      </button>
      <button
        onClick={() => setDeleteTarget(entry)}
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
          Palmarès — Ventes Conclues
        </p>
        <button
          onClick={openAdd}
          className="w-full md:w-auto bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] px-6 py-3 transition-colors duration-200 hover:bg-gray-800"
        >
          AJOUTER UNE VENTE +
        </button>
      </div>

      <AdminEntityTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        emptyMessage="Aucune vente enregistrée."
        renderCell={renderCell}
        renderMobileCardContent={renderMobileCardContent}
        renderDesktopActions={renderDesktopActions}
        renderMobileActions={renderMobileActions}
        mobileImageAspectRatio="4/3"
      />

      <PalmaresDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        message="Êtes-vous sûr(e) de vouloir supprimer cette entrée ?"
      />
    </>
  );
}
