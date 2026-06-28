type StubPageProps = {
  title: string;
};

export function StubPage({ title }: StubPageProps) {
  return (
    <section>
      <h1>{title}</h1>
    </section>
  );
}
