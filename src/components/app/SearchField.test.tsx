import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('submits typed query', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<SearchField onSearch={onSearch} />);

    await user.type(screen.getByPlaceholderText('Искать'), 'усы');
    await user.click(screen.getByRole('button', { name: 'Искать' }));

    expect(onSearch).toHaveBeenCalledWith('усы');
  });

  it('clears query, sends empty search and returns focus to input', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<SearchField onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Искать');

    expect(screen.queryByRole('button', { name: 'Очистить поиск' })).not.toBeInTheDocument();

    await user.type(input, 'винтаж');
    await user.click(screen.getByRole('button', { name: 'Очистить поиск' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(onSearch).toHaveBeenCalledWith('');
  });
});
