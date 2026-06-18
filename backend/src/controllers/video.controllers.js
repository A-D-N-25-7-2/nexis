import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { Playlist } from "../models/playlist.models.js";
import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";
import { Save } from "../models/save.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cleanUpFiles } from "../utils/cleanUpFiles.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 6,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pipeline = [];

  // Filter by userId if provided
  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  const isOwnChannel =
    userId && req.user && req.user._id.toString() === userId.toString();
  // Only published videos
    if (!isOwnChannel) {
      pipeline.push({
        $match: { isPublished: true },
      });
    }
  // Lookup owner ONCE
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $project: {
            fullName: 1,
            username: 1,
            avatar: 1,
          },
        },
      ],
    },
  });

  pipeline.push({
    $addFields: {
      owner: { $first: "$owner" },
    },
  });

  // Search by title, description, or owner username AFTER lookup
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { "owner.username": { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({
    $sort: {
      [sortBy]: sortType === "asc" ? 1 : -1,
    },
  });

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Videos successfully fetched.", videos));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;
  const videoFilePath = req.files?.video?.[0]?.path;

  const { title, description } = req.body;

  // TODO: get video, upload to cloudinary, create video
  if (title.trim() === "") {
    cleanUpFiles(thumbnailFilePath);
    cleanUpFiles(videoFilePath);
    throw new ApiError(400, "Title is required");
  }

  if (!videoFilePath) {
    cleanUpFiles(thumbnailFilePath);
    throw new ApiError(400, "Video is required");
  }

  const uploadedVideo = await uploadOnCloudinary(videoFilePath);
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailFilePath);

  if (!uploadedVideo) {
    cleanUpFiles(videoFilePath);
    cleanUpFiles(thumbnailFilePath);
    throw new ApiError(500, "Error while uploading video!!");
  }

  const newVideo = await Video.create({
    videoFile: uploadedVideo.secure_url,
    thumbnail: uploadedThumbnail.secure_url || null,
    title,
    description,
    duration: uploadedVideo.duration,
    owner: req.user._id,
    videoPublicId: uploadedVideo.public_id,
    thumbnailPublicId: uploadedThumbnail?.public_id || null,
  });

  const createdVideo = await Video.findById(newVideo._id);

  if (!createdVideo) {
    cleanUpFiles(thumbnailFilePath);
    cleanUpFiles(videoFilePath);

    throw new ApiError(500, "Error while creating video record");
  }

  return res.json(
    new ApiResponse(201, "Video successfully uploaded!!!", createdVideo)
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate videoId format
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }

  // Check if user is authenticated
  if (!req.user?._id) {
    throw new ApiError(401, "User not authenticated");
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);

  const pipeline = [];
  const ownerPipeline = [];

  // Match video
  pipeline.push({
    $match: { _id: new mongoose.Types.ObjectId(videoId) },
  });

  // Owner pipeline
  ownerPipeline.push({
    $lookup: {
      from: "subscriptions",
      localField: "_id",
      foreignField: "channel",
      as: "subscribers",
      pipeline: [{ $match: { isSubscribed: true } }],
    },
  });

  ownerPipeline.push({
    $addFields: {
      subscribersCount: { $size: "$subscribers" },
      isSubscribed: {
        $cond: {
          if: { $in: [userId, "$subscribers.subscriber"] },
          then: true,
          else: false,
        },
      },
    },
  });

  ownerPipeline.push({
    $project: {
      fullName: 1,
      username: 1,
      avatar: 1,
      subscribersCount: 1,
      isSubscribed: 1,
    },
  });

  // Lookup owner
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: ownerPipeline,
    },
  });

  pipeline.push({
    $addFields: { owner: { $first: "$owner" } },
  });

  // Lookup likes
  pipeline.push({
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "video",
      as: "likes",
      pipeline: [{ $match: { isLiked: true } }],
    },
  });

  pipeline.push({
    $addFields: {
      likesCount: { $size: "$likes" },
      isLiked: {
        $cond: {
          if: { $in: [userId, "$likes.likedBy"] },
          then: true,
          else: false,
        },
      },
    },
  });

  pipeline.push({
    $lookup: {
      from : "saves",
      localField: "_id",
      foreignField: "video",
      as: "saves",
      pipeline: [{ $match: {
        savedBy: new mongoose.Types.ObjectId(req.user._id),
        isSaved: true
      }}]
    }
  })

  pipeline.push({
    $addFields: {
      isSaved: {$gt: [{ $size: "$saves" }, 0]},
    }
  })

  pipeline.push({ $project: { 
    likes: 0,
    saves: 0,
   } });

   const playlistPipeline = [];

   playlistPipeline.push(
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
      }
    }
   )

   playlistPipeline.push({
    $project: {
      _id: 1,
      name: 1
    }
   })

  const video = await Video.aggregate(pipeline);
  const playlist = await Playlist.aggregate(playlistPipeline);

  if (!video.length) throw new ApiError(404, "Video not found");


  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", {video: video[0], playlist}));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailFilePath = req.file?.path;

  const fetchedVideo = await Video.findById(videoId);

  if (!fetchedVideo) {
    throw new ApiError(400, "Video not found!!");
  }

  if (!fetchedVideo.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this.");
  }

  let thumbnail = fetchedVideo.thumbnail;
  let thumbnailPublicId = fetchedVideo.thumbnailPublicId;

  if (thumbnailFilePath) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFilePath);

    if (!uploadedThumbnail) {
      throw new ApiError(500, "Error while uploading to Cloudinary");
    }

    await deleteFromCloudinary(thumbnailPublicId, "image");

    thumbnail = uploadedThumbnail.url;
    thumbnailPublicId = uploadedThumbnail.public_id;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || fetchedVideo.title,
        description: description || fetchedVideo.description,
        thumbnail,
        thumbnailPublicId,
      },
    },
    {
      returnDocument: "after",
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Details updated successfully!", updatedVideo));
});

const increaseVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { returnDocument: "after" }
  );
  if (!updatedVideo) {
    throw new ApiError(400, "Video not found!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "View count increased!", updatedVideo));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const fetchedVideo = await Video.findById(videoId);
  if (!fetchedVideo) {
    throw new ApiError(400, "No such video Exist!!");
  }
  if (!fetchedVideo.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }

  const comments = await Comment.find({ video: videoId }).select("_id");
  const commentIds = comments.map((c) => c._id);

  // 2. Delete all likes on those comments
  if (commentIds.length > 0) {
    await Like.deleteMany({ comment: { $in: commentIds } });
  }

  // 3. Delete all likes on the video itself
  await Like.deleteMany({ video: videoId });

  // 4. Delete all comments on this video
  await Comment.deleteMany({ video: videoId });

    await Playlist.updateMany(
      { videos: videoId },
      { $pull: { videos: videoId } }
    );

  const deletedVideo = await Video.findByIdAndDelete(fetchedVideo._id);
  if (!deletedVideo) {
    throw new ApiError(500, "Error while deleting video");
  }

  // Delete both video and thumbnail from Cloudinary
  if (fetchedVideo.videoPublicId) {
    await deleteFromCloudinary(fetchedVideo.videoPublicId, "video");
  }
  if (fetchedVideo.thumbnailPublicId) {
    await deleteFromCloudinary(fetchedVideo.thumbnailPublicId, "image");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video successfully deleted!!", deletedVideo));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const fetchedVideo = await Video.findById(videoId);

  if (!fetchedVideo) {
    throw new ApiError(400, "Couldn't find video");
  }

  if (!req.user._id.equals(fetchedVideo.owner)) {
    throw new ApiError(400, "You are not authorized to perform this action.");
  }

  fetchedVideo.isPublished = !fetchedVideo.isPublished;
  await fetchedVideo.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video Publish status successfully changed!",
        fetchedVideo
      )
    );
});

const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Validate videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Update watch history
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    [
      {
        $set: {
          watchHistory: {
            $slice: [
              {
                $concatArrays: [
                  [new mongoose.Types.ObjectId(videoId)],
                  {
                    $filter: {
                      input: {
                        $cond: [
                          { $isArray: "$watchHistory" },
                          "$watchHistory",
                          [],
                        ],
                      },
                      cond: {
                        $ne: ["$$this", new mongoose.Types.ObjectId(videoId)],
                      },
                    },
                  },
                ],
              },
              100,
            ],
          },
        },
      },
    ],
    { returnDocument: "after", updatePipeline: true } // Added updatePipeline: true
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Added to watch history", {
        watchHistory: updatedUser.watchHistory,
      })
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
  increaseVideoViews,
  addToWatchHistory
};
