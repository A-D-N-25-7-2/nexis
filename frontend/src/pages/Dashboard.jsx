import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  getChannelStats,
  getChannelVideosForDashboard,
  togglePublishStatus,
  deleteVideo,
} from '../features/dashboard/dashboardApi';
import { formatCount } from '../utils/formatCount';
import { formatDate } from '../utils/formatDate';
import { formatDuration } from '../utils/formatDuration';
import {
  Eye,
  ThumbsUp,
  Users,
  PlaySquare,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Toggle from '../components/Toggle';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import ConfirmationModal from '../components/ConfirmationModal'
import UpdateVideoModal from '../components/video/UpdateVideoModal';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const currentUser = useSelector(selectCurrentUser);
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateModalOpen , setIsUpdateModalOpen] = useState(false);
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['channelStats'],
    queryFn: getChannelStats,
    staleTime: 1000 * 60 * 5,
  });

  const { data: videosRes, isLoading: videosLoading } = useQuery({
    queryKey: ['dashboardVideos'],
    queryFn: getChannelVideosForDashboard,
    staleTime: 1000 * 60 * 5,
  });

  const stats = statsRes?.data;
  const videos = videosRes?.data || [];

  const toggleMutation = useMutation({
    mutationFn: togglePublishStatus,
    onMutate: async (videoId) => {
      await queryClient.cancelQueries(['dashboardVideos']);
      const previous = queryClient.getQueryData(['dashboardVideos']);
      queryClient.setQueryData(['dashboardVideos'], (old) => ({
        ...old,
        data: old.data.map((v) =>
          v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
        ),
      }));
      return { previous };
    },
    onError: (err, videoId, context) => {
      queryClient.setQueryData(['dashboardVideos'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['dashboardVideos']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardVideos']);
      queryClient.invalidateQueries(['channelStats']);
      toast.success("Video deleted.");
    },
  });

  const handleDelete = async (videoId) => {
    setDeletingId(videoId);
    try {
      await deleteMutation.mutateAsync(videoId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Welcome back, {currentUser?.fullName}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-16 h-8 mb-3" />
              <div className="h-8 bg-zinc-800 rounded w-20 h-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Views"
            value={formatCount(stats?.totalViews || 0)}
          />
          <StatCard
            label="Subscribers"
            value={formatCount(stats?.totalSubscribers || 0)}
          />
          <StatCard
            label="Total Likes"
            value={formatCount(stats?.totalLikes || 0)}
          />
          <StatCard
            label="Total Videos"
            value={formatCount(stats?.totalVideos || 0)}
          />
        </div>
      )}

      {/* Videos table */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-white font-semibold">Your Videos</h2>
        </div>

        {videosLoading ? (
          <div className="divide-y divide-zinc-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row items-center gap-4 px-6 py-4 animate-pulse"
              >
                <div className=" w-full sm:w-36 aspect-video rounded-lg bg-zinc-800 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PlaySquare size={48} className="text-zinc-700 mb-3" />
            <p className="text-zinc-400 font-medium">No videos yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              Upload your first video to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {videos.map((video) => (
              <div
                key={video._id}
                className="flex flex-col sm:flex-row  sm:items-center gap-5 px-6 py-4 hover:bg-zinc-800/30 transition-colors duration-200"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-36 aspect-video rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {video.isPublished ? (
                    <span className="absolute top-1.5 right-1.5  sm:hidden items-center gap-1.5 text-[11px] text-emerald-400 bg-zinc-800/70 border border-emerald-400/20 px-2.5 py-1 rounded-full font-medium">
                      Published
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 sm:hidden items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-800/70 border border-zinc-700/50 px-2.5 py-1 rounded-full font-medium">
                      Draft
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md tracking-wide">
                    {formatDuration(video.duration)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate tracking-wide">
                    {video.title}
                  </p>
                  <p className="text-zinc-500 text-[11px] mt-1 tracking-wider">
                    {formatDate(video.createdAt)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700/50">
                      <Eye size={11} />
                      {formatCount(video.views)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700/50">
                      <ThumbsUp size={11} />
                      {formatCount(video.likesCount || 0)}
                    </span>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex  items-center gap-4 shrink-0">
                  <div className="flex items-center gap-3">
                    {video.isPublished ? (
                      <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-medium">
                        Published
                      </span>
                    ) : (
                      <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-800 border border-zinc-700/50 px-2.5 py-1 rounded-full font-medium">
                        Draft
                      </span>
                    )}
                    <Toggle
                      defaultOn={video.isPublished}
                      onChange={() => toggleMutation.mutate(video._id)}
                    />
                  </div>

                  <EditButton
                    onClick={() => {
                      setIsUpdateModalOpen(true);
                      setEditingVideo(video);
                    }}
                  />

                  <DeleteButton
                    onClick={() => {
                      setDeletingId(video._id);
                      setIsOpen(true)}}
                    disabled={deletingId === video._id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isUpdateModalOpen && (
        <UpdateVideoModal
          video={editingVideo}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setEditingVideo(null);
          }}
        />
      )}
      {isOpen && (
        <ConfirmationModal
          isOpen={isOpen}
          onClose={() => {
            setDeletingId(null);
            setIsOpen(false)
          }}
          onConfirm={() => {
            handleDelete(deletingId);
            setIsOpen(false);
          }}
          heading="Video Delete"
          content="Are you sure you want to delete this video? This
            action cannot be undone."
        />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-zinc-900 space-y-3 rounded-2xl p-5">
    <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
    <p className="text-zinc-500 text-sm">{label}</p>
  </div>
);

export default Dashboard;