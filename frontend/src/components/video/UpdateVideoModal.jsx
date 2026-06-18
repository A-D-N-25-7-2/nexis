import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X, Upload, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVideoDetails } from "../../features/video/videoApi";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Max 100 characters"),
  description: z.string().max(1000, "Max 1000 characters").optional(),
  thumbnail: z.instanceof(FileList).optional(),
});

const UpdateVideoModal = ({ video, onClose }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(video.thumbnail);
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
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: video.title,
      description: video.description || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (formData) => updateVideoDetails(video._id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", video._id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardVideos"] });
      toast.success("Video details updated.");
      onClose();
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || "Update failed. Please try again.",
      );
    },
  });

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data) => {
    setError("");
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    if (data.thumbnail?.[0]) {
      formData.append("thumbnail", data.thumbnail[0]);
    }
    mutation.mutate(formData);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    onClose();
  };

  // No field changed at all -> disable submit
  const hasChanges = isDirty || !!dirtyFields.thumbnail;

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
            Update Video Details
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
                Updating video details...
              </h2>
              <p className="text-zinc-500 text-sm">This won't take long.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6 p-6"
            >
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("title")}
                  placeholder="Give your video a title"
                  className="bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600"
                />
                {errors.title && (
                  <p className="text-red-400 text-xs">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Tell viewers about your video..."
                  rows={4}
                  className="bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 resize-none"
                />
                {errors.description && (
                  <p className="text-red-400 text-xs">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Thumbnail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm">
                  Thumbnail <span className="text-zinc-600">(optional)</span>
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-40 aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0 flex items-center justify-center">
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={24} className="text-zinc-600" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-3 text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                      <Upload size={16} />
                      Change thumbnail
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("thumbnail")}
                      onChange={(e) => {
                        register("thumbnail").onChange(e);
                        handleThumbnailChange(e);
                      }}
                    />
                  </label>
                </div>
                {errors.thumbnail && (
                  <p className="text-red-400 text-xs">
                    {errors.thumbnail.message}
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
                disabled={mutation.isPending || !hasChanges}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {mutation.isPending ? "Updating..." : "Update Video"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateVideoModal;
