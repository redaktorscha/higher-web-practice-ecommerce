import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Button, Icon } from '@/components/ui';

type SearchFieldProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  placeholder?: string;
  onSearch?: (value: string) => void;
};

function SearchField({ className, placeholder = 'Искать', onSearch, ...props }: SearchFieldProps) {
  return (
    <form
      className={cn('flex h-10 w-full overflow-hidden rounded-lg border border-primary bg-card', className)}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSearch?.(String(formData.get('search') ?? ''));
      }}
      {...props}
    >
      <input
        name="search"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
      <Button className="h-10 w-[67px] rounded-none" variant="iconPrimary" type="submit" aria-label="Искать">
        <Icon name="search" />
      </Button>
    </form>
  );
}

export { SearchField };
