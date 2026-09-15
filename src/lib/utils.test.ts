import { cn } from './utils';

describe('cn', () => {
  it('joins conditional classes and removes conflicting Tailwind classes', () => {
    expect(cn('px-2 text-sm', null, undefined, 'px-4', { 'text-primary': true })).toBe('text-sm px-4 text-primary');
  });
});
