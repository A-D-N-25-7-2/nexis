import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Note } from "../models/note.models.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { geminiApiCall } from "../utils/geminiApiCall.js";
import mongoose from "mongoose";

const getNotes = asyncHandler (async (req, res) => {

    const { videoId } = req.params;

    const fetchedVideo = await Video.findById(videoId);

    if(!fetchedVideo){
        throw new ApiError(404, "Video not found !");
    }

    const findNotes = await Note.findOne({
        video: videoId
    }) 

    if(findNotes){
        return res
        .status(200)
        .json(new ApiResponse(200, "Notes found!", findNotes));
    }

    const geminiResponse = await geminiApiCall(fetchedVideo.videoFile);

    const createNotes = await Note.create({
        video : videoId,
        notes : geminiResponse
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Notes created!", createNotes));
});

export {
    getNotes,
};