const VideoSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {/* Thumbnail */}
      <div className="w-full aspect-video rounded-xl bg-zinc-800" />

      {/* Info */}
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3.5 bg-zinc-800 rounded w-full" />
          <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default VideoSkeleton;
