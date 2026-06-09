interface PriceRowProps {
  label: string;
  value: string;
  bold: boolean;
  divider: boolean;
}

export function PriceRow({ label, value, bold, divider }: PriceRowProps) {
  return (
    <div>
      <div className="flex justify-between items-center py-4">
        <span
          className={`font-jost font-light text-vd-meta text-price-row ${
            bold ? 'uppercase tracking-widest' : ''
          }`}
        >
          {label}
        </span>
        <span
          className={`font-jost text-vd-text ${bold ? 'text-lg font-semibold' : 'text-sm font-normal'}`}
        >
          {value}
        </span>
      </div>
      {divider && <div className="border-t border-vd-border" />}
    </div>
  );
}
