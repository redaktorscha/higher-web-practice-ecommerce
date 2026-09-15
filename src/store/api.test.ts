import { buildProductsQuery, type FilterState } from './api';

const baseFilters: FilterState = {
  page: 1,
  limit: 12,
  search: '',
  category: null,
  styles: [],
  density: null,
  requiresWax: null,
  boostsCharisma: null,
  minPrice: '',
  maxPrice: '',
  sortBy: null,
  order: null,
};

function parseQuery(filters: Partial<FilterState>) {
  return new URLSearchParams(buildProductsQuery({ ...baseFilters, ...filters }));
}

describe('buildProductsQuery', () => {
  it('adds pagination by default', () => {
    const query = parseQuery({ page: 2, limit: 24 });

    expect(query.get('_page')).toBe('2');
    expect(query.get('_limit')).toBe('24');
  });

  it('serializes sidebar filters for json-server', () => {
    const query = parseQuery({
      category: 'Классические',
      styles: ['Деловой', 'Винтаж'],
      density: 'Низкая',
      requiresWax: true,
      boostsCharisma: false,
      minPrice: 1000,
      maxPrice: '3000',
    });

    expect(query.get('category')).toBe('Классические');
    expect(query.getAll('style')).toEqual(['Деловой', 'Винтаж']);
    expect(query.get('density')).toBe('Низкая');
    expect(query.get('requiresWax')).toBe('true');
    expect(query.get('boostsCharisma')).toBe('false');
    expect(query.get('price_gte')).toBe('1000');
    expect(query.get('price_lte')).toBe('3000');
  });

  it('serializes sorting', () => {
    const query = parseQuery({ sortBy: 'price', order: 'asc' });

    expect(query.get('_sort')).toBe('price');
    expect(query.get('_order')).toBe('asc');
  });

  it('serializes non-empty search and trims spaces', () => {
    const query = parseQuery({ search: '  инженер  ' });

    expect(query.get('q')).toBe('инженер');
  });
});
