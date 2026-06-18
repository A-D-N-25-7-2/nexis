import React from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const schema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  avatar: z
  .instanceof(FileList)
  .refine((files) => files.length === 1, "Avatar is required"),

  coverImage: z
  .instanceof(FileList)
  .optional()
});

const Register = () => {

  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setError("");
    if (data.password.toLowerCase().includes(data.username.toLowerCase())) {
      setError("Password cannot contain your username");
      return;
    }
    setLoading(true);

    try {
      const Formdata = new FormData();
      Formdata.append('fullName', data.fullName);
      Formdata.append('username', data.username);
      Formdata.append('email', data.email);
      Formdata.append('password', data.password);
      Formdata.append('avatar', data.avatar[0]);
      if (data.coverImage?.[0] && data.coverImage.length > 0) {
        Formdata.append('coverImage', data.coverImage[0]);
      }
      await registerUser(Formdata);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Full Name
            </label>
            <input
              {...register("fullName")}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Username</label>
            <input
              {...register("username")}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="johndoe"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Avatar */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Avatar <span className="text-red-400">*</span>
            </label>
            <input
              {...register("avatar")}
              type="file"
              accept="image/*"
              className="w-full bg-zinc-800 text-zinc-400 rounded-lg px-4 py-2.5 outline-none file:mr-3 file:bg-red-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-sm cursor-pointer"
            />
            {errors.avatar && (
              <p className="text-red-400 text-xs mt-1">
                {errors.avatar.message}
              </p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">
              Cover Image <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              {...register("coverImage")}
              type="file"
              accept="image/*"
              className="w-full bg-zinc-800 text-zinc-400 rounded-lg px-4 py-2.5 outline-none file:mr-3 file:bg-red-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-sm cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-zinc-500 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-400 hover:text-red-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
};

export default Register