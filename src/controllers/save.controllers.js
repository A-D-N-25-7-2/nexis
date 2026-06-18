import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Save } from "../models/save.models.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const toggleSave = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle save on video
  const savedVideo = await Save.findOne({
    video: videoId,
    savedBy: req.user._id
  });

  if(savedVideo){
    savedVideo.isSaved = !savedVideo.isSaved;
    await savedVideo.save();

    return res
    .status(200)
    .json(new ApiResponse(200, `Video ${savedVideo.isSaved ? 'saved' : 'not saved'}.`, savedVideo));
  }

  const createSave = await Save.create({
    savedBy: req.user._id,
    video: videoId
  });

  return res
  .status(200)
  .json(new ApiResponse(200, `Video ${createSave.isSaved ? 'saved' : 'not saved'}.`, createSave));
});

const getSavedVideos = asyncHandler(async (req, res) => {
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
        savedBy: new mongoose.Types.ObjectId(req.user._id),
        isSaved: true,
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

  const videos = await Save.aggregate(pipeline);
  
    return res
      .status(200)
      .json(new ApiResponse(200, "Videos fetched!!", videos));
});

export { toggleSave, getSavedVideos };