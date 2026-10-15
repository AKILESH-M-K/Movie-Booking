function Loading({ message = "Loading CineBook..." }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center bg-canvas px-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-canvas-muted border-t-brand" />
        <p className="mt-4 text-base font-medium font-sans text-ink-secondary">{message}</p>
      </div>
    </div>
  );
}

export default Loading;
