import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlaylist } from "../../features/playlist/playlistApi";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
});

const UpdatePlaylistModal = ({ playlist, onClose }) => {
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: playlist.name,
      description: playlist.description || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => updatePlaylist(playlist._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlist._id] });
      queryClient.invalidateQueries({ queryKey: ["channelPlaylists"] });
      toast.success("Playlist details updated.");
      onClose();
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || "Update failed. Please try again.",
      );
    },
  });

  const onSubmit = (data) => {
    setError("");
    mutation.mutate(data);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-xs"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h1 className="text-white text-lg font-semibold">
            Update Playlist Details
          </h1>
          <button
            onClick={handleClose}
            disabled={mutation.isPending}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {mutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
              <Loader2 size={48} className="text-red-500 animate-spin" />
              <h2 className="text-white text-xl font-semibold">
                Updating playlist details...
              </h2>
              <p className="text-zinc-500 text-sm">This won't take long.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6 p-6"
            >
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="Give your playlist a name"
                  className="bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <textarea
                  {...register("description")}
                  placeholder="What's this playlist about..."
                  rows={4}
                  className="bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 resize-none"
                />
                {errors.description && (
                  <p className="text-red-400 text-xs">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-400/10 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={mutation.isPending || !isDirty}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {mutation.isPending ? "Updating..." : "Update Playlist"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePlaylistModal;
