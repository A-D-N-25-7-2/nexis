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
    like.isLiked = !like.isLiked;
    like.createdAt = 
    await like.save();

    return res
    .status(200)
    .json(new ApiResponse(200, `Video ${like.isLiked ? 'liked' : 'disliked'}.`, null));
  }

  const createLike = await Like.create({
    likedBy: req.user._id,
    video: videoId
  });

  return res
  .status(200)
  .json(new ApiResponse(200, `Video ${createLike.isLiked ? 'liked' : 'disliked'}.`, createLike));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const like = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (like) {
    like.isLiked = !like.isLiked;
    await like.save();

    return res.status(200).json(new ApiResponse(200, `Comment ${like.isLiked ? 'liked' : 'disliked'}.`, null));
  }

  const createLike = await Like.create({
    likedBy: req.user._id,
    comment: commentId,
  });

  return res.status(200).json(new ApiResponse(200, `Comment ${createLike.isLiked ? 'liked' : 'disliked'}.`, createLike));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const like = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (like) {
    like.isLiked = !like.isLiked;
    await like.save();

    return res.status(200).json(new ApiResponse(200, `Tweet ${like.isLiked ? 'liked' : 'disliked'}.`, null));
  }

  const createLike = await Like.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  return res.status(200).json(new ApiResponse(200, `Tweet ${createLike.isLiked ? 'liked' : 'disliked'}.`, createLike));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const pipeline = [];
  const userpipeline = [];

  userpipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
    },
  });

  userpipeline.push({
    $addFields: {
      owner: { $first: "$owner" },
    },
  });

  userpipeline.push({
    $project: {
      _id: 1,
      title: 1,
      thumbnail: 1,
      views: 1,
      createdAt: 1,
      duration: 1,
      owner: {
        _id: 1,
        fullName: 1,
        username: 1,
        avatar: 1,
      },
    },
  });


  pipeline.push({
    $match:{
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        isLiked: true,
        video: { $exists: true, $ne: null }
    }
  });

  pipeline.push({
    $lookup:{
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: userpipeline
    }
  });

  pipeline.push({
    $unwind: "$videoDetails"
  });

  pipeline.push({
    $sort: { updatedAt: -1 }, // -1 = descending, latest first
  });
  
  pipeline.push({
    $project: {
      _id: "$videoDetails._id",
      title: "$videoDetails.title",
      thumbnail: "$videoDetails.thumbnail",
      views: "$videoDetails.views",
      createdAt: "$videoDetails.createdAt",
      duration: "$videoDetails.duration",
      owner: "$videoDetails.owner",
    },
  });

  const videos = await Like.aggregate(pipeline);
  
    return res
      .status(200)
      .json(new ApiResponse(200, "Videos fetched!!", videos));
});


export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
