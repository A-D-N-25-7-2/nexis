import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
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
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const pipeline = [];

  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  if (query) {
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails"
        }
    });
    pipeline.push({
      $match: {
        $or: [
          {
            title: { $regex: query, $options: "i" },
          },
          {
            description: { $regex: query, $options: "i" },
          },
          {
            "ownerDetails.username" : { $regex: query, $options: "i"},
          }
        ],
      },
    });
  }

  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

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
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url || null,
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

  if (!videoId?.trim()) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const getVideo = await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", getVideo));
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

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const fetchedVideo = await Video.findById(videoId);
  if (!fetchedVideo) {
    throw new ApiError(400, "No such video Exist!!");
  }
  if (!fetchedVideo.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action.");
  }

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

  if (!req.user._id.equals(fetchedVideo.owner)) {
    throw new ApiError(400, "You are not authorized to perform this action.");
  }

  if (!fetchedVideo) {
    throw new ApiError(400, "Couldn't find video");
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

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
};
