import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {

  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pipeline = [];

  pipeline.push(
    {
        $match: { 
            video: new mongoose.Types.ObjectId(videoId)
        }
    }
  );

  pipeline.push(
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",  
            as: "owner",
            pipeline:[
                {
                    $project: {
                        fullName: 1,
                        username: 1,
                        avatar: 1
                    }
                }
            ]
        } 
    }
  )
  
  pipeline.push({
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "comment",
      as: "likes",
      pipeline: [
        {
          $match: { isLiked: true }, // ← only count actual likes
        },
      ],
    },
  });

  pipeline.push({
    $addFields: {
      likesCount: { $size: "$likes" },
      isLiked: {
        $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
      }
    }
  })

  pipeline.push({
    $project: {
      content: 1,
      owner: { $first: "$owner" },
      likesCount: 1,
      isLiked: 1,
      createdAt: 1,
      updatedAt: 1
    }
  });
  

  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  }
  const comments = await Comment.aggregatePaginate(
    Comment.aggregate(pipeline)
    , options
  )

  return res
  .status(200)
  .json(new ApiResponse(200, "Comments fetched!!", comments));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment cannot be empty!");
  }

  const newComment = await Comment.create({
    content,
    owner: req.user._id,
    video: videoId,
  });
  const addedComment = await Comment.findById(newComment._id);

  if (!addedComment) {
    throw new ApiError(500, "Error while creating comment!!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Comment successfully created", addedComment));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  
  if (!content?.trim()) {
    throw new ApiError(400, "Comment cannot be empty!");
  }

  const fetchedComment = await Comment.findById(commentId);
  if(!fetchedComment){
    throw new ApiError( 404 , "Comment not found");
  }

  if(!fetchedComment.owner.equals(req.user._id)){
    throw new ApiError(403, "You are not authorized to perform this action..");
  }

  fetchedComment.content = content;
  await fetchedComment.save();

  return res
  .status(200)
  .json(new ApiResponse(200, "Comment updated successfully!", fetchedComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const fetchedComment = await Comment.findById(commentId);

  if(!fetchedComment){
    throw new ApiError(404, "Comment not found!!");
  }

  if (!fetchedComment.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to perform this action..");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
  .status(200)
  .json(new ApiResponse(200, "Comment successfully deleted!!", null));
});

export { getVideoComments, addComment, updateComment, deleteComment };
