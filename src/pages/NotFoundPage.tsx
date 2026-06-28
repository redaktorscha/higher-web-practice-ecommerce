import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <section className="grid justify-items-start gap-4">
      <p className="text-sm text-muted-foreground">Ошибка 404</p>
      <h1>Страница не найдена</h1>
      <Button asChild>
        <Link to="/">Вернуться на главную</Link>
      </Button>
    </section>
  );
}
