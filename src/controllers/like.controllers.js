import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const like = await Like.findOne({
    video: videoId,
    likedBy: req.user._id
  });

  if(like){
    await Like.findByIdAndDelete(like._id);

    return res
    .status(200)
    .json(new ApiResponse(200, "Video disliked.", null));
  }

  const createLike = await Like.create({
    likedBy: req.user._id,
    video: videoId
  });

  return res
  .status(200)
  .json(new ApiResponse(200, "Video liked.", createLike));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const like = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (like) {
    await Like.findByIdAndDelete(like._id);

    return res.status(200).json(new ApiResponse(200, "Comment disliked.", null));
  }

  const createLike = await Like.create({
    likedBy: req.user._id,
    comment: commentId,
  });

  return res.status(200).json(new ApiResponse(200, "Comment liked.", createLike));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const like = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (like) {
    await Like.findByIdAndDelete(like._id);

    return res.status(200).json(new ApiResponse(200, "Tweet disliked.", null));
  }

  const createLike = await Like.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  return res.status(200).json(new ApiResponse(200, "Tweet liked.", createLike));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const pipeline = [];

  pipeline.push({
    $match:{
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true, $ne: null }
    }
  });

  pipeline.push({
    $lookup:{
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails"
    }
  });

  pipeline.push({
    $unwind: "$videoDetails"
  });

  pipeline.push({
    $project:{
        _id:1,
        videoId: "$videoDetails._id",
        title: "$videoDetails.title",
        thumbnail: "$videoDetails.thumbnail"
    }
  });

  const videos = await Like.aggregate(pipeline);
  
    return res
      .status(200)
      .json(new ApiResponse(200, "Videos fetched!!", videos));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
