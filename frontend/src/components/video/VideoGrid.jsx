import VideoCard from "./VideoCard";
import VideoSkeleton from "./VideoSkeleton";

const VideoGrid = ({ videos, loading, skeletonCount = 12 , showAvatar=true, showName=true}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-zinc-400 text-lg font-medium">No videos found</p>
        <p className="text-zinc-600 text-sm mt-1">
          Try a different search or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} showAvatar={showAvatar} showName={showName} />
      ))}
    </div>
  );
};

export default VideoGrid;
