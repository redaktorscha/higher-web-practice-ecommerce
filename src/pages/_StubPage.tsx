type StubPageProps = {
  title?: string;
};

export function StubPage({ title = 'Страница' }: StubPageProps) {
  return (
    <main>
      <h1>{title}</h1>
      <p>Страница в разработке.</p>
    </main>
  );
}
