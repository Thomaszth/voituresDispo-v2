interface DeleteConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ open, onConfirm, onCancel }: DeleteConfirmProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white border border-vd-border p-6 w-full max-w-sm">
        <p className="font-cormorant font-light text-vd-text text-xl leading-snug mb-6">
          Êtes-vous sûr(e) de vouloir supprimer ce véhicule ?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-vd-black text-white font-jost uppercase font-light py-3 text-xs tracking-[0.15em] transition-colors duration-200 hover:bg-gray-800"
          >
            SUPPRIMER
          </button>
          <button
            onClick={onCancel}
            className="w-full border border-vd-border font-jost uppercase font-light py-3 text-xs tracking-[0.15em] text-vd-text transition-colors duration-200 hover:bg-vd-surface"
          >
            ANNULER
          </button>
        </div>
      </div>
    </div>
  );
}
