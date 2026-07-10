import {
  FiAward,
  FiBell,
  FiCreditCard,
  FiFileText,
  FiFlag,
  FiGrid,
  FiHash,
  FiHome,
  FiPhoneCall,
  FiSearch,
  FiShield,
  FiUser
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { NavIconKey } from '@/components/layout/mobile-menu';

const iconMap: Record<NavIconKey, IconType> = {
  home: FiHome,
  services: FiGrid,
  payments: FiCreditCard,
  tax: FiFileText,
  report: FiFlag,
  track: FiSearch,
  account: FiUser,
  rewards: FiAward,
  transparency: FiHash,
  news: FiBell,
  hotlines: FiPhoneCall
};

export function NavIcon({ name, className }: { name?: NavIconKey; className?: string }) {
  const Icon = name ? iconMap[name] : FiShield;
  return <Icon aria-hidden="true" className={className} />;
}
