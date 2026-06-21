import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListVideo, ArrowLeft, X } from "lucide-react";
import VideoCard from "../video/VideoCard";
import {
  getPlaylistById,
  removeVideoFromPlaylist,
} from "../../features/playlist/playlistApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import toast from "react-hot-toast";

const PlaylistView = () => {
  const queryClient = useQueryClient();
  const currentUser = useSelector(selectCurrentUser);
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => getPlaylistById(playlistId),
    enabled: !!playlistId,
    staleTime: 1000 * 60 * 5,
  });

  const playlistData = data?.[0] || {};
  const meta = playlistData;
  const videos = playlistData.videos || [];
  const isOwner = currentUser?._id === meta?.owner;

  const removeMutation = useMutation({
    mutationFn: ({ playlistId, videoId }) =>
      removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: () => {
      toast.success("Video removed.");
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
    onError: (err) => {
      toast.error("Error occurred while removing video.");
      console.log("Error occurred while removing video: ", err);
    },
  });

  const handleRemoveVideo = (e, videoId) => {
    e.stopPropagation(); // prevent navigating to /watch
    removeMutation.mutate({ playlistId, videoId });
  };

  return (
    <div className="min-h-screen bg-zinc-950 max-w-7xl mx-auto">
      {/* Playlist header */}
      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
          <ListVideo size={22} className="text-zinc-400" />
        </div>
        <div>
          {isLoading ? (
            <>
              <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-72 bg-zinc-800 rounded animate-pulse" />
            </>
          ) : (
            <>
              <h1 className="text-white text-xl font-semibold">
                {meta.name || "Playlist"}
              </h1>
              {meta.description && (
                <p className="text-zinc-400 text-sm mt-1">{meta.description}</p>
              )}
              <p className="text-zinc-600 text-xs mt-1">
                {videos.length} {videos.length === 1 ? "video" : "videos"}
              </p>
            </>
          )}
        </div>
      </div>
      {/* Videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
        {videos.map((video, i) => {
          const originalIndex = i;
          return (
            <div className="relative" key={video._id}>
              <div
                onClick={() =>
                  navigate(`/watch/${video._id}`, {
                    state: { playlist: videos, currentIndex: originalIndex },
                  })
                }
                className="cursor-pointer"
              >
                <VideoCard video={video} showAvatar={false} showName={false} />
              </div>
              {isOwner && (
                <button
                  onClick={(e) => handleRemoveVideo(e, video._id)}
                  disabled={removeMutation.isPending}
                  className=" absolute backdrop-blur-sm top-2 right-2 p-1 rounded-full bg-black/30 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistView;
