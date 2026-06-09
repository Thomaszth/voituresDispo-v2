interface SpecCellProps {
  label: string;
  value: string;
}

export function SpecCell({ label, value }: SpecCellProps) {
  return (
    <div className="border-b border-vd-border pb-4">
      <p className="font-jost uppercase text-vd-caption mb-2 text-label tracking-widest">
        {label}
      </p>
      <p className="font-jost font-normal text-vd-text text-sm">
        {value}
      </p>
    </div>
  );
}
