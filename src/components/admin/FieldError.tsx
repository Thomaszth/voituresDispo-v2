import { ADMIN_LOGIN_LABELS } from '../../constants/adminLabels';

interface FieldErrorProps {
  show: boolean;
}

export function FieldError({ show }: FieldErrorProps) {
  if (!show) return null;
  return (
    <p className="font-jost font-light mt-2 text-[11px] text-vd-caption w-full text-left">
      {ADMIN_LOGIN_LABELS.requiredField}
    </p>
  );
}
