import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-base font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-100 [&_svg]:size-5',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground',
        secondary: 'border border-primary bg-secondary text-secondary-foreground hover:bg-muted disabled:border-input disabled:text-muted-foreground',
        text: 'bg-transparent px-0 text-primary hover:text-primary-hover disabled:text-muted-foreground',
        iconPrimary: 'size-10 bg-primary p-0 text-primary-foreground hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground',
        iconSecondary: 'size-10 border border-primary bg-secondary p-0 text-primary hover:bg-muted disabled:border-input disabled:text-muted-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        mobile: 'h-9 px-4 py-2 text-sm',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button };
