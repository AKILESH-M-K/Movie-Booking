function Loading({ message = "Loading CineBook..." }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center bg-[#f9f4e4] px-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e6dcc5] border-t-[#a4652a]" />
        <p className="mt-4 text-base font-bold text-[#736956]">{message}</p>
      </div>
    </div>
  );
}

export default Loading;
