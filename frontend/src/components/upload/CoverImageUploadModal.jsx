import React from "react";
import { Upload, FileVideo, ImagePlus, X, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { changeChannelCoverImage } from "../../features/channel/channelApi";

const schema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "File is required")
    .refine((f) => f.type.startsWith("image/"), "Only image files are allowed"),
});

const CoverImageUploadModal = ({ isOpen, onClose , onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setValue("file", file, { shouldValidate: true });
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setCoverImagePreview(null);
    setError("");
    reset();
    onClose();
    };

  const handleUpload = async (data) => {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("coverImage", data.file);
    try {
      const response = await changeChannelCoverImage(formData);
      reset();
      setUploading(false);
      setUploaded(true);
      onSuccess();
      setTimeout(() => {
        setCoverImagePreview(null);
        setUploaded(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to upload cover image";
      setError(errorMsg);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 backdrop-blur-xs"
        onClick={handleClose}
        disabled={uploading}
      />
      <div className="relative  z-10 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h1 className="text-white text-lg font-semibold">Upload Cover Image</h1>
          <button
            disabled={uploading}
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>
        {uploaded ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
            <CheckCircle2 size={64} className="text-green-500" />
            <h2 className="text-white text-2xl font-bold">
              Cover image uploaded successfully!
            </h2>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="relative w-100 h-20">
              {coverImagePreview ? (
                <img
                  src={coverImagePreview}
                  alt="Cover image preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-col justify-center text-center gap-2 items-center">
                    <ImagePlus size={32} className="text-zinc-600" />
                    <p className="text-zinc-400 text-xs">
                      click to choose file
                    </p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute opacity-0 object-cover inset-0 w-full h-full cursor-pointer"
                onChange={handleCoverImageChange}
              />
            </div>
            {errors.file && (
              <p className="text-red-400 text-xs -mt-4">
                {errors.file.message}
              </p>
            )}
            <div className="flex flex-col items-center gap-8">
              <p className="text-zinc-400 text-sm">
                Click the button below to upload a new cover image
              </p>
              {error && <p className="text-red-400 text-xs -mt-4">{error}</p>}
              <button
                onClick={handleSubmit(handleUpload)}
                disabled={uploading}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Cover Image"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverImageUploadModal;
