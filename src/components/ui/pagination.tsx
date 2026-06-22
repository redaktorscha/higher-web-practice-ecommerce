import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return <nav aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />;
}

function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-row items-center gap-2', className)} {...props} />;
}

function PaginationItem({ ...props }: ComponentProps<'li'>) {
  return <li {...props} />;
}

type PaginationLinkProps = ComponentProps<'button'> & {
  isActive?: boolean;
};

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? 'primary' : 'iconSecondary'}
      size="icon"
      className={cn('size-10 rounded-md text-sm', className)}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: ComponentProps<'button'>) {
  return (
    <PaginationLink className={className} aria-label="Предыдущая страница" {...props}>
      <ChevronLeft className="size-4" />
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: ComponentProps<'button'>) {
  return (
    <PaginationLink className={className} aria-label="Следующая страница" {...props}>
      <ChevronRight className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span className={cn('flex size-10 items-center justify-center text-muted-foreground', className)} {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Больше страниц</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
