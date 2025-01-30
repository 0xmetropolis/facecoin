export function TokenGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[600px] mx-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-white shadow-sm rounded-sm overflow-hidden"
        >
          <div className="w-full h-full bg-muted/20" />
        </div>
      ))}
    </div>
  );
}
