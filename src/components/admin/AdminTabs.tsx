import { ADMIN_TAB_LABELS } from '../../constants/adminLabels';
import type { AdminTab } from '../../types/adminTab';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const tabs: { key: AdminTab; label: string }[] = [
  { key: 'stock', label: ADMIN_TAB_LABELS.stock },
  { key: 'palmares', label: ADMIN_TAB_LABELS.palmares },
  { key: 'recherches', label: ADMIN_TAB_LABELS.recherches },
  { key: 'liens', label: ADMIN_TAB_LABELS.liens },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="flex gap-8 flex-wrap">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`font-jost uppercase bg-transparent border-none p-0 pb-2 transition-colors duration-150 tracking-[0.15em] text-[13px] ${
            activeTab === tab.key
              ? 'font-normal text-vd-text border-b-2 border-vd-text'
              : 'font-light text-vd-caption border-b-2 border-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
