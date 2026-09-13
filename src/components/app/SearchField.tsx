import type { ComponentProps } from 'react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, Icon } from '@/components/ui';

type SearchFieldProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  placeholder?: string;
  onSearch?: (value: string) => void;
};

function SearchField({ className, placeholder = 'Искать', onSearch, ...props }: SearchFieldProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clearSearch = () => {
    setValue('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  return (
    <form
      className={cn('flex h-10 w-full overflow-hidden rounded-lg border border-primary bg-card', className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(value);
      }}
      {...props}
    >
      <input
        ref={inputRef}
        name="search"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
        onChange={(event) => setValue(event.target.value)}
        value={value}
      />
      {value ? (
        <button
          aria-label="Очистить поиск"
          className="grid h-10 w-10 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={clearSearch}
          type="button"
        >
          <Icon name="x" size={16} />
        </button>
      ) : null}
      <Button className="h-10 w-[67px] rounded-none" variant="iconPrimary" type="submit" aria-label="Искать">
        <Icon name="search" />
      </Button>
    </form>
  );
}

export { SearchField };
