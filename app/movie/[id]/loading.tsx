export default function Loading() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pt-32 md:flex-row">
        <div className="skeleton-shimmer aspect-[2/3] w-full md:w-1/3" />
        <div className="flex-1 space-y-5">
          <div className="skeleton-shimmer h-14 w-3/4" />
          <div className="skeleton-shimmer h-6 w-1/2" />
          <div className="skeleton-shimmer h-40 w-full" />
        </div>
      </div>
    </main>
  );
}
