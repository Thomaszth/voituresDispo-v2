import { Link } from 'react-router-dom';
import { LABEL_BACK_LINK } from '../constants/carDetailLabels';

interface BackToCatalogueLinkProps {
  className?: string;
}

export function BackToCatalogueLink({ className }: BackToCatalogueLinkProps) {
  return (
    <Link
      to="/catalogue"
      className={
        className ??
        'font-jost uppercase font-light text-[11px] tracking-[0.18em] transition-colors duration-200 text-vd-caption hover:text-vd-black'
      }
    >
      {LABEL_BACK_LINK}
    </Link>
  );
}
