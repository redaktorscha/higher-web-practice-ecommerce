import LogoFull from '@/assets/Logo-Full.svg?react';
import LogoMark from '@/assets/Logo-M.svg?react';
import { cn } from '@/lib/utils';

type LogoProps = {
  variant?: 'full' | 'mark';
  className?: string;
};

function Logo({ variant = 'full', className }: LogoProps) {
  const Component = variant === 'full' ? LogoFull : LogoMark;

  return (
    <a href="/" className={cn('inline-flex items-center', className)} aria-label="Uant">
      <Component className={variant === 'full' ? 'h-10 w-[131px]' : 'size-10'} />
    </a>
  );
}

export { Logo };
