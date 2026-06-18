import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileVideo, ImagePlus, X, CheckCircle2 } from "lucide-react";
import { uploadVideo } from "../../features/video/videoApi";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Max 100 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  videoFile: z
    .instanceof(FileList)
    .refine((f) => f.length > 0, "Video file is required"),
  thumbnail: z
    .instanceof(FileList)
    .refine((f) => f.length > 0, "Thumbnail is required"),
});

const UploadModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const videoInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    if (uploading) return;
    onClose();
  };

  const handleVideoChange = (file) => {
    if (!file) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    setValue("videoFile", dt.files, { shouldValidate: true });
    setVideoPreview({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("video/")) handleVideoChange(file);
  };

  const onSubmit = async (data) => {
    setUploading(true);
    setError("");
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("video", data.videoFile[0]);
      formData.append("thumbnail", data.thumbnail[0]);

      const res = await uploadVideo(formData, (percent) =>
        setProgress(percent),
      );
      setUploaded(true);
      setTimeout(() => {
        onClose();
        navigate(`/watch/${res.data._id}`);
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
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
          <h1 className="text-white text-lg font-semibold">Upload Video</h1>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {uploaded ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
              <CheckCircle2 size={64} className="text-green-500" />
              <h2 className="text-white text-2xl font-bold">
                Upload Successful!
              </h2>
              <p className="text-zinc-400">Redirecting to your video...</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6 p-6"
            >
              {/* Drop zone */}
              {!videoPreview ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => videoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors
                    ${
                      dragOver
                        ? "border-red-500 bg-red-500/10"
                        : "border-zinc-700 hover:border-zinc-500 bg-zinc-900"
                    }`}
                >
                  <FileVideo size={48} className="text-zinc-500" />
                  <div className="text-center">
                    <p className="text-white font-medium">
                      Drag & drop your video here
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-zinc-600 text-xs">
                    MP4, MOV, AVI supported
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    ref={videoInputRef}
                    onChange={(e) => handleVideoChange(e.target.files[0])}
                  />
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    {...register("videoFile")}
                  />
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600/20 p-3 rounded-xl">
                      <FileVideo size={24} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium truncate max-w-xs">
                        {videoPreview.name}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {videoPreview.size} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoPreview(null);
                      setValue("videoFile", undefined);
                    }}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              {errors.videoFile && (
                <p className="text-red-400 text-xs -mt-4">
                  {errors.videoFile.message}
                </p>
              )}

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
                  Thumbnail <span className="text-red-400">*</span>
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
                      {thumbnailPreview
                        ? "Change thumbnail"
                        : "Upload thumbnail"}
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

              {/* Progress */}
              {uploading && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Uploading to Cloudinary...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-zinc-500 text-xs">
                    Please don't close this tab while uploading
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                {uploading ? `Uploading ${progress}%` : "Upload Video"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
