import { ActionButton } from '../../components/ActionButton';
import {
  LABEL_SOLD_MESSAGE,
  LABEL_BTN_WHATSAPP,
  LABEL_BTN_SHARE,
  LABEL_BTN_LINK_COPIED,
} from '../../constants/carDetailLabels';

interface VoitureDetailActionsProps {
  isSold: boolean;
  copyToast: boolean;
  onWhatsAppClick: () => void;
  onShareClick: () => void;
}

export function VoitureDetailActions({
  isSold,
  copyToast,
  onWhatsAppClick,
  onShareClick,
}: VoitureDetailActionsProps) {
  if (isSold) {
    return (
      <div className="flex flex-col items-center text-center py-12 gap-4">
        <div className="w-12 border-t border-vd-border" />
        <p className="font-cormorant font-light italic text-vd-caption text-xl">
          {LABEL_SOLD_MESSAGE}
        </p>
        <div className="w-12 border-t border-vd-border" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ActionButton
        text={LABEL_BTN_WHATSAPP}
        onClick={onWhatsAppClick}
        variant="primary"
      />
      <ActionButton
        text={copyToast ? LABEL_BTN_LINK_COPIED : LABEL_BTN_SHARE}
        onClick={onShareClick}
        variant="secondary"
      />
    </div>
  );
}
