import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { productSortOptions, productViewOptions } from '@/components/app/productControlsConfig';
import type { ProductSortValue, ProductViewMode } from '@/components/app/productControlsConfig';

type ProductControlsProps = {
  onSortChange: (value: ProductSortValue) => void;
  onViewChange: (value: ProductViewMode) => void;
  selectedSort: ProductSortValue;
  selectedView: ProductViewMode;
};

function ProductControls({ onSortChange, onViewChange, selectedSort, selectedView }: ProductControlsProps) {
  return (
    <div className="flex gap-2">
      <Select onValueChange={(value) => onSortChange(value as ProductSortValue)} value={selectedSort}>
        <SelectTrigger className="h-8 min-w-[140px] rounded border-muted-foreground bg-background px-3 py-1 text-base leading-6">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {productSortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => onViewChange(value as ProductViewMode)} value={selectedView}>
        <SelectTrigger className="h-8 min-w-[140px] rounded border-muted-foreground bg-background px-3 py-1 text-base leading-6">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {productViewOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { ProductControls };
