import { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  Eye,
  Bookmark,
  NotebookText,
  ListVideo,
  Plus,
} from "lucide-react";
import {
  getVideoById,
  toggleVideoLike,
  increaseViewCount,
  addToWatchHistory,
  toggleVideoSave,
  getNotes,
} from "../features/video/videoApi";
import { addVideoToPlaylist } from "../features/playlist/playlistApi";
import { toggleSubscription } from "../features/subscription/subscriptionApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { formatCount } from "../utils/formatCount";
import { formatDate } from "../utils/formatDate";
import CommentSection from "../components/comment/CommentSection";
import NotesPanel from "../components/notes/NotesPanel";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import LikeButton from "../components/LikeButton";

const Watch = () => {
  const { videoId } = useParams();
  const currentUser = useSelector(selectCurrentUser);

  const [video, setVideo] = useState(null);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteError, setNoteError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [creatingNotes, setCreatingNotes] = useState(false);
  const [notes, setNotes] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [openPlaylistMenu, setOpenPlaylistMenu] = useState(false);
  const { playlist, currentIndex } = location.state || {};
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistMenu, setPlaylistMenu] = useState(null);
  const [popping, setPopping] = useState(false);
  const playlistMenuRef = useRef(null);
  const playlistPanelRef = useRef(null);

  useEffect(() => {
    const handleClickOutsidePlaylist = (e) => {
      if (
        playlistPanelRef.current &&
        !playlistPanelRef.current.contains(e.target)
      ) {
        setShowPlaylist(false);
      }
    };

    if (showPlaylist) {
      document.addEventListener("mousedown", handleClickOutsidePlaylist);
      document.addEventListener("touchstart", handleClickOutsidePlaylist);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsidePlaylist);
      document.removeEventListener("touchstart", handleClickOutsidePlaylist);
    };
  }, [showPlaylist]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        playlistMenuRef.current &&
        !playlistMenuRef.current.contains(e.target)
      ) {
        setOpenPlaylistMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); // for mobile
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleWatchHistory = async () => {
    try {
      await addToWatchHistory(videoId);
      queryClient.invalidateQueries({ queryKey: ["watchHistory"] });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const res = await getVideoById(videoId);
        const videoData = res.data.video;
        setVideo(videoData);
        setIsSaved(videoData.isSaved);
        setIsSubscribed(videoData.owner?.isSubscribed);
        setSubscribersCount(videoData.owner?.subscribersCount);
        setPlaylistMenu(res?.data?.playlist || []);
      } catch (err) {
        console.log("fetch video error:", err);
        setError("Failed to load video.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();

    const watchedKey = `watched_${videoId}`;
    handleWatchHistory(videoId);
    if (!sessionStorage.getItem(watchedKey)) {
      increaseViewCount(videoId);
      sessionStorage.setItem(watchedKey, "true");
    }

    return () => {
      setTimeout(() => {
        sessionStorage.removeItem(watchedKey);
      }, 500);
    };
  }, [videoId]);

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const response = await addVideoToPlaylist(playlistId, videoId);
      if (response?.data == null) {
        toast.success("Video already added to playlist.");
      } else {
        toast.success("Video added to playlist.");
        queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
        queryClient.invalidateQueries({
          queryKey: ["channelPlaylists", currentUser._id],
        });
      }
    } catch {
      toast.error("Error while adding video to playlist!");
    } finally {
      setOpenPlaylistMenu(false);
    }
  };

  const handleNotes = async () => {
    try {
      if (!showNotes) {
        // fetching on OPEN, not close
        setCreatingNotes(true);
        const response = await getNotes(videoId);
        setNotes(response.data.notes);
        setNoteError("");
      }
      setShowNotes((prev) => !prev);
    } catch (error) {
      setNoteError(error.message);
      setShowNotes(true);
    } finally {
      setCreatingNotes(false);
    }
  };

  const handleLike = async () => {
    const originalLiked = video.isLiked;
    const originalCount = video.likesCount;

    // optimistic update
    setVideo((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));

    try {
      await toggleVideoLike(videoId);
      queryClient.invalidateQueries({ queryKey: ["likedVideos"] });
    } catch {
      // rollback
      setVideo((prev) => ({
        ...prev,
        isLiked: originalLiked,
        likesCount: originalCount,
      }));
    }
  };

  const handleSave = async () => {
    const originalSaved = isSaved;
    setIsSaved(!originalSaved);
    try {
      await toggleVideoSave(videoId);
      queryClient.invalidateQueries({ queryKey: ["savedVideos"] });
    } catch {
      setIsLiked(originalSaved);
    }
  };

  const handleSubscribe = async () => {
    const originalSubscribed = isSubscribed;
    const originalCount = subscribersCount;
    setIsSubscribed(!originalSubscribed);
    setSubscribersCount(
      originalSubscribed ? originalCount - 1 : originalCount + 1,
    );
    try {
      await toggleSubscription(video.owner._id);
    } catch {
      setIsSubscribed(originalSubscribed);
      setSubscribersCount(originalCount);
    }
  };

  const handleVideoEnd = () => {
    if (!playlist || currentIndex === undefined) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      navigate(`/watch/${playlist[nextIndex]._id}`, {
        state: { playlist, currentIndex: nextIndex },
      });
    }
  };

  if (loading) return <WatchSkeleton />;
  if (error)
    return (
      <div className="text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  if (!video) return null;

  const isOwner = currentUser?._id === video.owner?._id;

  // Convert http to https for video URL
  const secureVideoUrl = video.videoFile?.replace(/^http:/, "https:") || "";

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-screen-xl">
      <div className="flex-1 min-w-0">
        {/* Player */}
        <div className="w-full relative aspect-video rounded-xl overflow-hidden bg-black">
          <video
            src={secureVideoUrl}
            controls
            autoPlay
            className="w-full h-full"
            controlsList="nodownload"
            crossOrigin="anonymous"
            onEnded={handleVideoEnd}
            onError={(e) => console.log("Video error:", e)}
          />

          {/* Toggle button */}
          {playlist && playlist.length > 0 && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                setShowPlaylist((prev) => !prev);
              }}
              className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors
        ${
          showPlaylist
            ? "bg-white/20 text-white border border-white/30"
            : "bg-black/50 text-white/80 hover:bg-black/70 border border-white/10"
        }`}
            >
              <ListVideo size={14} />
              {currentIndex + 1} / {playlist.length}
            </button>
          )}

          {/* Overlay panel */}
          {playlist && playlist.length > 0 && showPlaylist && (
            <div
              ref={playlistPanelRef}
              className="absolute inset-y-0 right-0 z-10 w-72 bg-black/50 backdrop-blur-md flex flex-col rounded-r-xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <ListVideo size={15} className="text-zinc-300" />
                  <span className="text-white text-sm font-medium">
                    Playlist
                  </span>
                </div>
                <span className="text-zinc-400 text-xs">
                  {currentIndex + 1} / {playlist.length}
                </span>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {playlist.map((v, i) => {
                  const actualIndex = i;
                  return (
                    <div
                      key={v._id}
                      onClick={() =>
                        navigate(`/watch/${v._id}`, {
                          state: { playlist, currentIndex: actualIndex },
                        })
                      }
                      className={`flex gap-2 p-2 rounded-lg cursor-pointer transition-colors
              ${
                actualIndex === currentIndex
                  ? "bg-white/15 border border-white/20"
                  : "hover:bg-white/10 border border-transparent"
              }`}
                    >
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-20 aspect-video object-cover rounded-md shrink-0"
                      />
                      <div className="flex flex-col justify-center min-w-0">
                        <p
                          className={`text-xs font-medium truncate leading-snug ${actualIndex === currentIndex ? "text-white" : "text-zinc-300"}`}
                        >
                          {v.title}
                        </p>
                        {actualIndex === currentIndex && (
                          <p className="text-xs text-red-400 mt-0.5">
                            Now playing
                          </p>
                        )}
                        {actualIndex === currentIndex + 1 && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Up next
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Title */}
        <h1 className="text-white font-semibold text-xl mt-4 leading-snug">
          {video.title}
        </h1>

        {/* Meta row */}
        <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mt-3">
          {/* Channel + Subscribe */}
          <div className="flex items-center justify-between xl:justify-start xl:gap-0">
            <Link
              to={`/channel/${video.owner?.username}`}
              className="flex items-center gap-3 group"
            >
              {video.owner?.avatar ? (
                <img
                  src={video.owner.avatar}
                  alt={video.owner.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                  {video.owner?.fullName?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white text-sm font-medium group-hover:text-red-400 transition-colors">
                  {video.owner?.fullName}
                </p>
                <p className="text-zinc-500 text-xs">
                  {formatCount(subscribersCount)} subscribers
                </p>
              </div>
            </Link>

            {/* Subscribe visible on mobile next to channel */}
            {!isOwner && (
              <button
                onClick={handleSubscribe}
                className={`xl:hidden px-5 py-2 rounded-full text-sm font-medium transition-colors
          ${
            isSubscribed
              ? "bg-zinc-700 hover:bg-zinc-600 text-white"
              : "bg-white hover:bg-zinc-200 text-black"
          }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 pl-2">
            <LikeButton
              element={video}
              onLike={handleLike}
              formatCount={formatCount}
            />
            <button
              onClick={handleSave}
              className={`shrink-0 group flex items-center gap-2 p-3 rounded-full text-sm font-medium transition-colors
        ${
          isSaved
            ? "text-blue-400 border-blue-400/40 border bg-blue-400/10 hover:bg-blue-400/15"
            : "border-zinc-700 border hover:border-white/70 text-zinc-300 bg-white/[0.07]"
        }`}
            >
              <Bookmark
                size={16}
                className={`transition-transform duration-300
          ${isSaved ? "fill-blue-400 stroke-blue-400" : "group-hover:scale-130 group-active:scale-60"}`}
              />
            </button>

            <div ref={playlistMenuRef}>
              <button
                onClick={() => {
                  setOpenPlaylistMenu((prev) => !prev);
                }}
                className={`group flex items-center gap-2 p-2 rounded-full text-sm font-medium transition-colors border ${openPlaylistMenu ? " border-amber-400/40  hover:bg-amber-400/15 text-amber-400 bg-amber-400/10" : " border-zinc-700  hover:border-white/70 text-zinc-300 bg-white/[0.07]"}`}
              >
                <Plus
                  size={16}
                  className="transition-transform duration-300 group-hover:scale-130 group-active:scale-60"
                />
                <span className="truncate">Add to Playlist</span>
              </button>

              {openPlaylistMenu && (
                <div
                  className={`dropdown-animate absolute top-26 xl:top-12 z-10 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden`}
                >
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <span className="text-white text-sm font-medium">
                      Your Playlists
                    </span>
                  </div>
                  {playlistMenu.length > 0 ? (
                    <div className=" flex flex-col truncate">
                      {playlistMenu.map((option) => (
                        <button
                          onClick={() => {
                            handleAddToPlaylist(option._id);
                          }}
                          key={option._id}
                          className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="block px-4 py-2.5 text-sm text-zinc-400">
                      No playlists created.
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleNotes}
              disabled={creatingNotes}
              className={`shrink-0 group flex items-center disabled:cursor-not-allowed disabled:opacity-70 gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
        ${
          showNotes
            ? "text-violet-400 border-violet-400/40 border bg-violet-400/10 hover:bg-violet-400/15"
            : "border-zinc-700 border hover:border-white/70 text-zinc-300 bg-white/[0.07]"
        }`}
            >
              <NotebookText
                size={16}
                className={`${showNotes ? "fill-violet-400 stroke-violet-400" : ""} group-hover:-rotate-15 transition-all duration-200`}
              />
              <span className="truncate">
                {creatingNotes ? "Creating..." : "Notes"}
              </span>
            </button>

            {/* Subscribe inside actions on xl */}
            {!isOwner && (
              <button
                onClick={handleSubscribe}
                className={`hidden xl:block shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors
          ${
            isSubscribed
              ? "bg-zinc-700 hover:bg-zinc-600 text-white"
              : "bg-white hover:bg-zinc-200 text-black"
          }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div
          className={`mt-4 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-300 cursor-pointer relative ${
            !descExpanded ? "min-h-40 overflow-hidden" : ""
          }`}
          onClick={() => setDescExpanded((prev) => !prev)}
        >
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 text-xs mb-2">
              {formatDate(video.createdAt)}
            </p>
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-zinc-700 border bg-white/[0.07] text-zinc-300 text-sm">
              <Eye size={16} />
              {formatCount(video.views)}
            </div>
          </div>
          <p
            className={`whitespace-pre-wrap mt-4 leading-relaxed ${
              !descExpanded ? "line-clamp-2" : ""
            }`}
          >
            {video.description || "No description provided."}
          </p>

          {!descExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end p-4 pointer-events-none">
              <p className="text-white font-medium">...more</p>
            </div>
          )}
          {descExpanded && (
            <p className="text-white font-medium mt-2">Show less</p>
          )}
        </div>

        <NotesPanel
          show={showNotes}
          loading={creatingNotes}
          notes={notes}
          onClose={handleNotes}
          error={noteError}
        />

        {/* Comments */}
        <div className="mt-6">
          <CommentSection videoId={videoId} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

const WatchSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-4 max-w-screen-xl">
    <div className="w-full aspect-video rounded-xl bg-zinc-800" />
    <div className="h-6 bg-zinc-800 rounded w-3/4" />
    <div className="flex justify-between">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full bg-zinc-800" />
        <div className="flex flex-col gap-2">
          <div className="h-3.5 bg-zinc-800 rounded w-32" />
          <div className="h-3 bg-zinc-800 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-24 bg-zinc-800 rounded-full" />
        <div className="h-9 w-20 bg-zinc-800 rounded-full" />
      </div>
    </div>
    <div className="h-24 bg-zinc-800 rounded-xl" />
  </div>
);

export default Watch;
