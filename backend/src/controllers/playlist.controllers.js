import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name.trim()) {
    throw new ApiError(400, "Playlist name cannot be empty!");
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  const createdPlaylist = await Playlist.findById(newPlaylist._id);

  if (!createdPlaylist) {
    throw new ApiError(500, "Error while creating Playlist!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist created.", createdPlaylist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const fetchedPlaylists = await Playlist.find({ owner: userId });

  if (fetchedPlaylists.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "No playlists found", []));
  }

  const pipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
        firstVideoId: { $first: "$videos" },
      },
    },
    // Lookup only the first video's thumbnail
    {
      $lookup: {
        from: "videos",
        let: { firstId: "$firstVideoId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$firstId"] } } },
          { $project: { thumbnail: 1 } },
        ],
        as: "firstVideo",
      },
    },
    {
      $addFields: {
        thumbnail: { $first: "$firstVideo.thumbnail" },
      },
    },
    // Lookup owner details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        totalVideos: 1,
        thumbnail: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];
  const playlists = await Playlist.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, "User playlists fetched", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
 const pipeline = [
   {
     $match: {
       _id: new mongoose.Types.ObjectId(playlistId),
     },
   },
   {
     $lookup: {
       from: "videos",
       localField: "videos",
       foreignField: "_id",
       as: "videoDetails",
     },
   },
   {
     $addFields: {
       videoDetails: {
         $map: {
           input: "$videos",
           as: "id",
           in: {
             $arrayElemAt: [
               {
                 $filter: {
                   input: "$videoDetails",
                   as: "v",
                   cond: { $eq: ["$$v._id", "$$id"] },
                 },
               },
               0,
             ],
           },
         },
       },
     },
   },
   {
     $project: {
       _id: 1,
       name: 1,
       description: 1,
       owner: 1,
       videos: {
         $map: {
           input: "$videoDetails",
           as: "v",
           in: {
             _id: "$$v._id",
             title: "$$v.title",
             duration: "$$v.duration",
             thumbnail: "$$v.thumbnail",
             views: "$$v.views",
             videoFile: "$$v.videoFile",
             createdAt: "$$v.createdAt",
           },
         },
       },
     },
   },
 ];
  const playlist = await Playlist.aggregate(pipeline);

  if(!playlist){
    throw new ApiError(404, "Playlist not found!!");
  }

   if (playlist.length === 0) {
     throw new ApiError(404, "Playlist is empty!!");
   }

   return res
     .status(200)
     .json(new ApiResponse(200, "Playlist fetched", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const fetchedPlaylist = await Playlist.findById(playlistId);

  if (!fetchedPlaylist) {
    throw new ApiError(404, "Playlist not found!!");
  }

  if (!fetchedPlaylist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!!");
  }

  if (fetchedPlaylist.videos.some((id) => id.equals(videoId))) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Video already added to playlist.", null));
  }

  fetchedPlaylist.videos.push(videoId);
  await fetchedPlaylist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Video added to playlist.", fetchedPlaylist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  const fetchedPlaylist = await Playlist.findById(playlistId);

  if (!fetchedPlaylist) {
    throw new ApiError(404, "Playlist not found!!");
  }

  if (!fetchedPlaylist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!!");
  }

  if (!fetchedPlaylist.videos.includes(videoId)) {
    throw new ApiError(400, "Video doesn't exists in playlist");
  }

  fetchedPlaylist.videos = fetchedPlaylist.videos.filter((id) => !id.equals(videoId));
  await fetchedPlaylist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video removed from playlist.", fetchedPlaylist)
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  const fetchedPlaylist = await Playlist.findById(playlistId);

  if (!fetchedPlaylist) {
    throw new ApiError(400, "No such playlist exists!!!");
  }

  if (!fetchedPlaylist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res.status(200).json(new ApiResponse(200, "Playlist deleted.", null));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!name.trim()) {
    throw new ApiError(400, "Playlist name cannot be empty!");
  }

  const fetchedPlaylist = await Playlist.findById(playlistId);

  if (!fetchedPlaylist) {
    throw new ApiError(404, "Cannot find tweet.");
  }

  if (!fetchedPlaylist.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }

  fetchedPlaylist.name = name;
  fetchedPlaylist.description = description;
  await fetchedPlaylist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist updated.", fetchedPlaylist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
