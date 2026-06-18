import React from "react";
import { Upload, FileVideo, ImagePlus, X, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { changePassword } from "../../features/channel/channelApi";

const schema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState("");
  const [changed, setChanged] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  const {
    register,
    handleSubmit,
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

  const handleClose = () => {
    setError("");
    reset();
    onClose();
  };

  const handleUpload = async (data) => {
    setError("");
    if (data.oldPassword === data.newPassword) {
      setError("New password cannot be the same as old password");
      return;
    }
    
    if (data.newPassword.toLowerCase().includes(currentUser.username.toLowerCase())) {
        setError("New password cannot contain your username");
        return;
    }

    setChanging(true);
    try {
      const response = await changePassword(data.oldPassword, data.newPassword);
      reset();
      setChanging(false);
      setChanged(true);
      setTimeout(() => {
        setChanged(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Password change error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to change password";
      setError(errorMsg);
      setChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 backdrop-blur-xs"
        onClick={handleClose}
        disabled={changing}
      />
      <div className="relative  z-10 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h1 className="text-white text-lg font-semibold">Change Password</h1>
          <button
            disabled={changing}
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>
        {changed ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
            <CheckCircle2 size={64} className="text-green-500" />
            <h2 className="text-white text-2xl font-bold">
              Password changed successfully!
            </h2>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 py-10 px-6 overflow-auto">
            <div className="relative w-full h-full max-w-md space-y-6">
              {error && (
                <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg">
                  {error}
                </p>
              )}
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">
                  Old Password
                </label>
                <input
                  {...register("oldPassword")}
                  type="password"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="••••••••"
                />
                {errors.oldPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.oldPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">
                  New Password
                </label>
                <input
                  {...register("newPassword")}
                  type="password"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="••••••••"
                />
                {errors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-8">
              <button
                onClick={handleSubmit(handleUpload)}
                disabled={changing}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {changing ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
