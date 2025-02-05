export function InfoSection({
  title,
  body,
}: {
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="container px-3 py-2 bg-transparent border border-theme-primary-border rounded-sm">
      <h3 className="font-semibold text-theme-primary-success">{title}</h3>
      {body}
    </div>
  );
}
