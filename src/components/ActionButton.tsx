interface ActionButtonProps {
  text: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}

export function ActionButton({ text, onClick, variant }: ActionButtonProps) {
  const baseClass = 'font-jost uppercase font-light py-3 px-6 rounded-sm transition-colors duration-200 text-xs tracking-widest';
  const variantClass =
    variant === 'primary'
      ? 'bg-vd-black text-white hover:bg-gray-800'
      : 'bg-white text-vd-black border border-vd-black hover:bg-vd-surface';

  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
      {text}
    </button>
  );
}
