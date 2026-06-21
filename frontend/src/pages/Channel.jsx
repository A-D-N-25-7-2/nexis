import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { setCredentials, selectCurrentUser } from "../features/auth/authSlice";
import {
  getUserChannel,
  getChannelVideos,
  getChannelPlaylists,
  getChannelTweets,
} from "../features/channel/channelApi";
import { toggleSubscription } from "../features/subscription/subscriptionApi";
import VideoGrid from "../components/video/VideoGrid";
import { formatCount } from "../utils/formatCount";
import { useState } from "react";
import EditButton from "../components/EditButton";
import { PencilIcon } from "@heroicons/react/24/outline";
import AvatarUploadModal from "../components/upload/AvatarUploadModal";
import CoverImageUploadModal from "../components/upload/CoverImageUploadModal";
import { changeChannelFullName } from "../features/channel/channelApi";
import ChannelTweets from "../components/channel/ChannelTweets";
import ChannelPlaylists from "../components/channel/ChannelPlaylists";

const TABS = ["Videos", "Playlists", "Tweets"];

const Channel = () => {
  const { username } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("Videos");
  const [editAvatarOpen, setEditAvatarOpen] = useState(false);
  const [editCoverOpen, setEditCoverOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [subscribersCount, setSubscribersCount] = useState(null);
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(
    currentUser?.fullName || "",
  );
const tabRefs = useRef({});
const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

useEffect(() => {
  const measure = () => {
    const activeEl = tabRefs.current[activeTab];
    if (activeEl) {
      setUnderlineStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  };

  measure(); // immediate attempt
  const raf = requestAnimationFrame(measure); // after paint
  const timeout = setTimeout(measure, 100); // fallback after fonts/layout settle

  window.addEventListener("resize", measure);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(timeout);
    window.removeEventListener("resize", measure);
  };
}, [activeTab]);

  const {
    data: channelRes,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => getUserChannel(username),
    staleTime: 1000 * 60 * 5,
  });

  const channel = channelRes?.data;

  useEffect(() => {
    if (channel) {
      setIsSubscribed(channel.isSubscribed);
      setSubscribersCount(channel.subscribersCount);
    }
  }, [channel]);

  const {
    data,
    isLoading: videosLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["channelVideos", channel?._id],
    queryFn: ({ pageParam }) => getChannelVideos(channel._id, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.data?.nextPage ?? undefined,
    enabled: !!channel?._id && activeTab === "Videos",
    staleTime: 1000 * 60 * 5,
  });

  const videos = data?.pages.flatMap((p) => p.data?.docs || []) ?? [];

  const loaderRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSubscribe = async () => {
    const originalSubscribed = isSubscribed;
    const originalCount = subscribersCount;
    setIsSubscribed(!originalSubscribed);
    setSubscribersCount(
      originalSubscribed ? originalCount - 1 : originalCount + 1,
    );
    try {
      await toggleSubscription(channel._id);
    } catch {
      setIsSubscribed(originalSubscribed);
      setSubscribersCount(originalCount);
    }
  };

  const handleFullNameChange = async () => {
    if (!fullNameInput.trim() || fullNameInput === channel.fullName) {
      setIsEditingFullName(false);
      setFullNameInput(channel.fullName);
      return;
    }
    try {
      await changeChannelFullName(fullNameInput);
      setIsEditingFullName(false);
      setFullNameInput(fullNameInput);
      queryClient.invalidateQueries({ queryKey: ["channel", username] });
      dispatch(
        setCredentials({
          user: { ...currentUser, fullName: fullNameInput },
        }),
      );
    } catch (error) {
      console.error("Error updating full name:", error);
    }
  };

  if (loading) return <ChannelSkeleton />;
  if (isError)
    return (
      <div className="text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
        Channel not found.
      </div>
    );
  if (!channel) return null;

  const isOwner = currentUser?._id === channel._id;

  return (
    <div
      className="max-w-screen-xl"
      onClick={() => {
        if (isEditingFullName) {
          setIsEditingFullName(false);
          setFullNameInput(channel.fullName);
        }
      }}
    >
      {/* Cover image section */}
      <div className="relative">
        <div className="relative w-full h-26 sm:h-52 overflow-hidden bg-zinc-800 group">
          {channel.coverImage ? (
            <img
              src={channel.coverImage}
              alt="cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          {isOwner && (
            <div className="absolute sm:h-12 sm:w-12 h-6 w-6 top-3 right-3 bg-black/40 hover:bg-black/60 text-white sm:p-1.5  rounded-full transition-colors">
              <EditButton
                onClick={() => setEditCoverOpen(true)}
                className="w-full h-full"
              />
            </div>
          )}
        </div>

        <div className="absolute left-1 sm:left-4 -bottom-10 sm:-bottom-16">
          <div className="group relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-zinc-950 shrink-0 bg-zinc-800 cursor-pointer">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold">
                {channel.fullName?.[0]?.toUpperCase()}
              </div>
            )}
            {isOwner && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
                <button
                  onClick={() => setEditAvatarOpen(true)}
                  className="w-full h-full hover:bg-zinc-700/40 rounded-full flex items-center justify-center"
                >
                  <PencilIcon className="w-1/3 h-1/3 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel info row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 px-1 mt-14 sm:mt-18">
        <div className="flex-1 min-w-0">
          <div className="flex gap-1">
            {isEditingFullName ? (
              <input
                type="text"
                value={fullNameInput}
                className="bg-transparent border-b border-zinc-700 focus:border-blue-500 text-white text-2xl font-bold w-full max-w-sm focus:outline-none"
                onChange={(e) => setFullNameInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={handleFullNameChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFullNameChange();
                  if (e.key === "Escape") {
                    setIsEditingFullName(false);
                    setFullNameInput(channel.fullName);
                  }
                }}
              />
            ) : (
              <h1 className="text-white text-2xl font-bold">
                {channel.fullName}
              </h1>
            )}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullNameInput(channel.fullName);
                  setIsEditingFullName((prev) => !prev);
                }}
                className="flex h-9 w-9  p-2 rounded-full items-center hover:bg-zinc-800 transition-colors"
              >
                <PencilIcon className="w-full h-full text-zinc-400" />
              </button>
            )}
          </div>
          <p className="text-zinc-400 text-sm mt-0.5">@{channel.username}</p>
          <div className="flex items-center gap-3 mt-1 text-zinc-500 text-sm">
            <span>
              {formatCount(subscribersCount ?? channel.subscribersCount)}{" "}
              subscribers
            </span>
            <span>·</span>
            <span>{formatCount(channel.totalVideos || 0)} videos</span>
          </div>
        </div>

        {!isOwner && (
          <button
            onClick={handleSubscribe}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors shrink-0
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

      {/* Tabs */}
      {/* Tabs */}
      <div className="border-b border-zinc-800 mb-6">
        <div className="flex gap-1 relative">
          {TABS.map((tab) => (
            <button
              key={tab}
              ref={(el) => (tabRefs.current[tab] = el)}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative
          ${
            activeTab === tab
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
            >
              {tab}
            </button>
          ))}

          {/* Shared sliding underline */}
          <span
            className="absolute bottom-0 h-0.5 bg-white rounded-full transition-all duration-300 ease-out"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "Videos" && (
        <>
          <VideoGrid
            videos={videos}
            loading={videosLoading}
            skeletonCount={8}
            showAvatar={false}
            showName={false}
          />
          <div ref={loaderRef} className="h-10 mt-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            </div>
          )}
          {!videosLoading && !hasNextPage && videos.length > 0 && (
            <p className="text-center text-zinc-600 text-sm py-6">
              All videos loaded
            </p>
          )}
          {!videosLoading && videos.length === 0 && (
            <p className="text-zinc-500 text-sm">No videos yet.</p>
          )}
        </>
      )}

      {activeTab === "Playlists" && (
        <ChannelPlaylists channelId={channel._id} isOwner={isOwner} />
      )}

      {activeTab === "Tweets" && (
        <ChannelTweets
          channelId={channel._id}
          channelUsername={channel.username}
          isOwner={isOwner}
          currentUser={currentUser}
          channel={channel}
        />
      )}

      {/* Modals */}
      <AvatarUploadModal
        isOpen={editAvatarOpen}
        onClose={() => setEditAvatarOpen(false)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["channel", username] })
        }
      />
      <CoverImageUploadModal
        isOpen={editCoverOpen}
        onClose={() => setEditCoverOpen(false)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["channel", username] })
        }
      />
    </div>
  );
};

const ChannelSkeleton = (isOwner) => {
  return (
    <div className="max-w-screen-xl animate-pulse">
      <div className="relative">
        <div className="w-full h-40 sm:h-52 bg-zinc-800 rounded-sm" />
        <div className="absolute left-1 sm:left-4 -bottom-10 sm:-bottom-16">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-zinc-950 bg-zinc-700" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 px-1 mt-14 sm:mt-18">
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="h-7 w-48 bg-zinc-700 rounded-md" />
          <div className="h-4 w-32 bg-zinc-800 rounded-md" />
          <div className="flex items-center gap-3 mt-1">
            <div className="h-3.5 w-28 bg-zinc-800 rounded-md" />
            <div className="h-3.5 w-1 bg-zinc-800 rounded-md" />
            <div className="h-3.5 w-16 bg-zinc-800 rounded-md" />
          </div>
        </div>
        {!isOwner && (
          <div className="h-10 w-28 rounded-full bg-zinc-700 shrink-0" />
        )}
      </div>
      <div className="border-b border-zinc-800 mb-6" />
      <div className="h-5 w-16 bg-zinc-700 rounded-md mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-full aspect-video bg-zinc-800 rounded-lg" />
            <div className="h-4 w-full bg-zinc-700 rounded-md" />
            <div className="h-4 w-3/4 bg-zinc-800 rounded-md" />
            <div className="h-3 w-1/2 bg-zinc-800 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Channel;
