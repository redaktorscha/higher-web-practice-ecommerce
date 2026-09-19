import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import type { Product } from '@/types';

export function ProductGallery({ product }: { product: Product }) {
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({ loop: true });
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({ containScroll: 'keepSnaps', dragFree: true });

  const onThumbClick = useCallback((index: number) => {
    if (emblaMainApi && emblaThumbsApi) emblaMainApi.scrollTo(index);
  }, [emblaMainApi, emblaThumbsApi]);

  const onSelect = useCallback(() => {
    if (emblaMainApi && emblaThumbsApi) emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi]);

  useEffect(() => {
    if (!emblaMainApi) return;
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="relative group">
      <button aria-label="Предыдущее фото" className="absolute top-[205px] left-[-8px] z-10 cursor-pointer text-primary-hover md:hidden" onClick={() => emblaMainApi?.scrollPrev()} type="button">
        <ChevronLeft className="size-10" />
      </button>
      <button aria-label="Следующее фото" className="absolute top-[205px] right-[-8px] z-10 cursor-pointer text-primary-hover md:hidden" onClick={() => emblaMainApi?.scrollNext()} type="button">
        <ChevronRight className="size-10" />
      </button>

      <div className="mx-auto h-[453px] w-[335px] overflow-hidden rounded-md bg-card md:h-[460px] md:w-[456px]" ref={emblaMainRef}>
        <div className="flex">
          {product.images.map((image, index) => (
            <div className="flex aspect-square min-w-0 flex-[0_0_100%] items-center justify-center bg-white" key={index}>
              <img src={image} alt={product.name} className="h-full w-full object-contain" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 hidden h-[106px] items-center gap-2 md:flex">
        <button aria-label="Предыдущее фото" className="cursor-pointer" onClick={() => emblaMainApi?.scrollPrev()} type="button">
          <ChevronLeft className="size-4 text-muted-foreground" />
        </button>
        <div className="flex" ref={emblaThumbsRef}>
          {product.images.map((image, index) => (
            <button className="cursor-pointer" key={image} onClick={() => onThumbClick(index)} type="button">
              <img alt="" className="h-24 w-[97px] object-contain" src={image} />
            </button>
          ))}
        </div>
        <button aria-label="Следующее фото" className="cursor-pointer" onClick={() => emblaMainApi?.scrollNext()} type="button">
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
