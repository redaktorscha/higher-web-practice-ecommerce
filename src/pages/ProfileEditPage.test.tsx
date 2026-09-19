import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditPage } from './ProfileEditPage';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { UpdateProfilePayload, User } from '@/types';

const user: User = {
  id: 'user-1',
  firstName: 'Иван',
  lastName: 'Иванов',
  email: 'ivan@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  language: 'ru',
  notifyByEmail: true,
};

describe('ProfileEditPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('requires a password and sends it when updating the profile', async () => {
    const clicker = userEvent.setup();
    let requestBody: UpdateProfilePayload | null = null;

    localStorage.setItem('token', btoa(JSON.stringify({
      id: user.id,
      exp: Date.now() + 86_400_000,
    })));

    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const bodyText = typeof input === 'string'
        ? String(init?.body ?? '{}')
        : await input.clone().text();

      requestBody = JSON.parse(bodyText) as UpdateProfilePayload;

      return new Response(JSON.stringify({ ...user, ...requestBody }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    renderWithProviders(<ProfileEditPage />, {
      preloadedState: {
        auth: { user, token: 'token', isAuthenticated: true },
      },
    });

    await clicker.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    await clicker.type(screen.getByLabelText('Пароль'), 'new-password');
    await clicker.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(requestBody).toEqual({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: 'new-password',
      });
    });

    expect(await screen.findByText('Профиль сохранён')).toBeInTheDocument();
  });
});
