export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse rounded-t-xl bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="border-t border-border px-4 py-3">
        <div className="h-9 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-8 animate-pulse rounded-full bg-gray-200"
          style={{ width: `${60 + i * 16}px` }}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
