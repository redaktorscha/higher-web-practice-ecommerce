import {
  Home,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const icons = {
  home: Home,
  search: Search,
  shoppingBag: ShoppingBag,
  sliders: SlidersHorizontal,
  user: User,
  x: X,
} satisfies Record<string, LucideIcon>;

type IconName = keyof typeof icons;

type IconProps = Omit<ComponentProps<LucideIcon>, 'ref'> & {
  name: IconName;
  size?: 16 | 24;
};

function Icon({ name, size = 24, className, strokeWidth = 2, ...props }: IconProps) {
  const Component = icons[name];

  return <Component aria-hidden="true" className={cn(size === 16 ? 'size-4' : 'size-6', className)} strokeWidth={strokeWidth} {...props} />;
}

export { Icon };
export type { IconName };
