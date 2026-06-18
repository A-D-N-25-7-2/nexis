import { useQuery } from "@tanstack/react-query";
import { getLikedVideos } from "../features/video/videoApi";
import VideoGrid from "../components/video/VideoGrid";
import { ThumbsUp } from "lucide-react";

const LikedVideos = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["likedVideos"],
    queryFn: getLikedVideos,
    staleTime: 1000 * 60 * 5,
  });

  const videos = data?.data || [];

  if (isError)
    return (
      <div className="text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
        Failed to load liked videos.
      </div>
    );

  return (
    <div className="max-w-screen-xl">
      <h1 className="text-white text-2xl font-bold mb-6">Liked Videos</h1>

      {!isLoading && videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <ThumbsUp size={48} className="text-zinc-700" />
          <p className="text-zinc-400 font-medium">No liked videos yet</p>
          <p className="text-zinc-600 text-sm">
            Videos you like will appear here
          </p>
        </div>
      ) : (
        <VideoGrid videos={videos} loading={isLoading} />
      )}
    </div>
  );
};

export default LikedVideos;
