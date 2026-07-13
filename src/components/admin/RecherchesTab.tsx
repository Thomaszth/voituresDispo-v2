import { useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { RechercheDrawer } from '../RechercheDrawer';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import { useRecherchesAdmin, notifyRecherchesAdminChanged, RechercheAdminDB } from '../../hooks/useRecherchesAdmin';
import { notifyRecherchesChanged } from '../../hooks/useRecherches';
import { AdminEntityTable } from './AdminEntityTable';

const ACTION_BTN =
  'font-jost font-light text-xs text-vd-meta hover:text-vd-text underline-offset-2 hover:underline transition-colors duration-150 cursor-pointer bg-transparent border-none p-0';

const COLUMNS = [
  { key: 'photo', header: 'Photo' },
  { key: 'vehicle', header: 'Véhicule' },
  { key: 'specifics', header: 'Spécifications' },
  { key: 'note', header: 'Note' },
  { key: 'status', header: 'Statut' },
  { key: 'actions', header: 'Actions' },
];

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function RecherchesTab() {
  const { recherches, loading } = useRecherchesAdmin();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RechercheAdminDB | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RechercheAdminDB | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (entry: RechercheAdminDB) => {
    setEditing(entry);
    setDrawerOpen(true);
  };

  const toggleStatus = async (entry: RechercheAdminDB) => {
    const newStatus = entry.status === 'trouve' ? 'active' : 'trouve';
    await supabase.from('recherches').update({ status: newStatus }).eq('id', entry.id);
    notifyRecherchesAdminChanged();
    notifyRecherchesChanged();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await supabase.from('recherches').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    notifyRecherchesAdminChanged();
    notifyRecherchesChanged();
  };

  const rows = recherches.map(entry => ({
    id: entry.id,
    photo: entry.photo ?? null,
    photoAlt: entry.car_name,
    item: entry,
  }));

  const renderCell = (entry: RechercheAdminDB, columnKey: string): ReactNode => {
    switch (columnKey) {
      case 'vehicle':
        return (
          <p className="font-jost font-[400] text-vd-text text-sm whitespace-nowrap">
            {entry.car_name}
          </p>
        );
      case 'specifics':
        return (
          <p className="font-jost font-light text-sm" style={{ color: '#6B6B6B' }}>
            {truncate(entry.specifics, 60)}
          </p>
        );
      case 'note':
        return (
          <p className="font-jost font-light text-sm" style={{ color: '#6B6B6B' }}>
            {truncate(entry.budget_note, 40)}
          </p>
        );
      case 'status':
        return (
          <p className="font-jost font-light text-vd-meta text-sm">
            {entry.status === 'trouve' ? 'Trouvé' : 'Active'}
          </p>
        );
      default:
        return null;
    }
  };

  const renderMobileCardContent = (entry: RechercheAdminDB): ReactNode => (
    <>
      <p className="font-jost font-[400] text-vd-text text-sm">
        {entry.car_name}
      </p>
      <p className="font-jost font-light text-sm mt-1" style={{ color: '#6B6B6B' }}>
        {truncate(entry.specifics, 60)}
      </p>
      {entry.budget_note && (
        <p className="font-jost font-light text-xs mt-1" style={{ color: '#6B6B6B' }}>
          {truncate(entry.budget_note, 40)}
        </p>
      )}
      <p className="font-jost font-light text-vd-meta text-xs mt-1">
        {entry.status === 'trouve' ? 'Trouvé' : 'Active'}
      </p>
    </>
  );

  const renderDesktopActions = (entry: RechercheAdminDB): ReactNode => (
    <>
      <button className={ACTION_BTN} onClick={() => openEdit(entry)}>
        Modifier
      </button>
      <button className={ACTION_BTN} onClick={() => toggleStatus(entry)}>
        {entry.status === 'trouve' ? 'Marquer comme active' : 'Marquer comme trouvé'}
      </button>
      <button
        className={`${ACTION_BTN} hover:!text-vd-text`}
        onClick={() => setDeleteTarget(entry)}
      >
        Supprimer
      </button>
    </>
  );

  const renderMobileActions = (entry: RechercheAdminDB): ReactNode => (
    <>
      <button
        onClick={() => openEdit(entry)}
        className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
      >
        Modifier
      </button>
      <button
        onClick={() => toggleStatus(entry)}
        className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
      >
        {entry.status === 'trouve' ? 'Marquer comme active' : 'Marquer comme trouvé'}
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
          RECHERCHES — DEMANDES EN COURS
        </p>
        <button
          onClick={openAdd}
          className="w-full md:w-auto bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] px-6 py-3 transition-colors duration-200 hover:bg-gray-800"
        >
          AJOUTER UNE RECHERCHE +
        </button>
      </div>

      <AdminEntityTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        emptyMessage="Aucune recherche enregistrée."
        renderCell={renderCell}
        renderMobileCardContent={renderMobileCardContent}
        renderDesktopActions={renderDesktopActions}
        renderMobileActions={renderMobileActions}
        mobileImageAspectRatio="4/3"
      />

      <RechercheDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        message="Êtes-vous sûr(e) de vouloir supprimer cette recherche ?"
      />
    </>
  );
}
