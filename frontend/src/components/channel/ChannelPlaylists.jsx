import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getChannelPlaylists } from "../../features/channel/channelApi";
import {
  createPlaylist,
  deletePlaylist,
} from "../../features/playlist/playlistApi";
import { ListVideo, Plus, X } from "lucide-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import ConfirmationModal from "../ConfirmationModal";
import toast from "react-hot-toast";
import UpdatePlaylistModal from "../playlist/UpdatePlaylistModal";
import { PencilIcon } from "@heroicons/react/24/outline";

const ChannelPlaylists = ({ channelId, isOwner }) => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["channelPlaylists", channelId],
    queryFn: () => getChannelPlaylists(channelId),
    staleTime: 1000 * 60 * 5,
    enabled: !!channelId,
  });

  const playlists = data?.data || [];

  const createMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries(["channelPlaylists", channelId]);
      setShowCreate(false);
      setName("");
      setDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries(["channelPlaylists", channelId]);
      toast.success("Playlist deleted.");
    },
  });

  return (
    <div>
      {/* Create button — owner only */}
      {isOwner && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            New Playlist
          </button>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-xs"
            onClick={() => setShowCreate(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md mx-4 flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
              <h2 className="text-white text-lg font-semibold">New Playlist</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-6 p-6">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Playlist"
                  className="bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this playlist about?"
                  rows={4}
                  className="bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-zinc-400 hover:text-white border border-zinc-500 hover:bg-white/10 hover:border-white/80 text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    createMutation.mutate({
                      name: name.trim(),
                      description: description.trim(),
                    })
                  }
                  disabled={createMutation.isPending || !name.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {createMutation.isPending ? "Creating..." : "Create Playlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-zinc-800" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <ListVideo size={48} className="text-zinc-700" />
          <p className="text-zinc-400 font-medium">No playlists yet</p>
          {isOwner && (
            <p className="text-zinc-600 text-sm">
              Create a playlist to organize your videos
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="group relative">
              <Link to={`/playlists/${playlist._id}`}>
                <div className="relative">
                  {/* Stacked card effect (behind layers) */}
                  <div className="absolute border border-zinc-900 -top-1.5 left-1/2 -translate-x-1/2 w-[97%] h-full bg-zinc-600 rounded-xl z-2" />
                  <div className="absolute border border-zinc-900 -top-3 left-1/2 -translate-x-1/2 w-[94%] h-full bg-zinc-700 rounded-xl z-1" />

                  {/* Main thumbnail */}
                  <div className="aspect-video border border-zinc-900 bg-zinc-800 relative overflow-hidden rounded-xl z-3">
                    {playlist.thumbnail ? (
                      <img
                        src={playlist.thumbnail}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ListVideo size={32} className="text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
                      <ListVideo size={14} />
                      <span className="font-medium">
                        {playlist.totalVideos || 0} videos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <p className="text-white text-sm font-medium truncate">
                    {playlist.name}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">Playlist</p>
                  {playlist.description && (
                    <p className="text-zinc-500 text-xs mt-0.5 truncate">
                      {playlist.description}
                    </p>
                  )}
                </div>
              </Link>

              {isOwner && (
                <div>
                  <button
                    onClick={() => {
                      setEditPlaylist(playlist);
                      setIsEditModalOpen(true);
                    }}
                    disabled={isEditModalOpen}
                    className="absolute z-4 group/child p-2 bg-black/70 rounded-full border backdrop-blur-xs border-zinc-700 flex items-center justify-center hover:bg-zinc-700/50 hover:border-blue-500 hover:scale-110 active:scale-95 transition-all duration-200 top-2 right-12 disabled:opacity-50"
                  >
                    <PencilIcon className=" w-3 h-3 text-zinc-400 group-hover/child:text-blue-400 group-hover/child:-rotate-12 group-hover:scale-110 transition-all duration-200" />
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setPlaylistId(playlist._id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="absolute z-4 group/child p-2 bg-black/70 rounded-full border backdrop-blur-xs border-zinc-700 flex items-center justify-center hover:bg-zinc-700/50 hover:border-red-500 hover:scale-110 active:scale-95 transition-all duration-200 top-2 right-2 disabled:opacity-50"
                  >
                    <TrashIcon className=" w-3 h-3 text-zinc-400 group-hover/child:text-red-400 group-hover/child:rotate-6 group-hover:scale-110 transition-all duration-200" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {isEditModalOpen && editPlaylist && (
        <UpdatePlaylistModal
          playlist={editPlaylist}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditPlaylist(null);
          }}
        />
      )}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setPlaylistId(null);
        }}
        onConfirm={() => {
          deleteMutation.mutate(playlistId);
          setPlaylistId(null);
          setIsOpen(false);
        }}
        heading="Delete Playlist"
        content="Are you sure you want to delete this playlist? This
            action cannot be undone."
      />
    </div>
  );
};

export default ChannelPlaylists;
