import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  
  if(!content.trim() ){
    throw new ApiError(400, "Tweet cannot be empty!");
  }

  const newTweet = await Tweet.create({
    content ,
    owner: req.user._id
  });

  const createdTweet = await Tweet.findById(newTweet._id);

  if(!createdTweet){
    throw new ApiError(500, "Error while creating Tweet!!");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, "Tweet posted.", createdTweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const pipeline = [];

  pipeline.push(
    {
      $match:{
        owner: new mongoose.Types.ObjectId(userId)
      }
    }
  )

  const options = {
    page: 1,
    limit: 10
  }

  const tweets = await Tweet.aggregatePaginate(
    Tweet.aggregate(pipeline), options
  )

  return res
  .status(200)
  .json(new ApiResponse(200, "Tweets fetched.", tweets));

});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const {tweetId} = req.params;
  const {content} =  req.body;

  if (!content.trim()) {
    throw new ApiError(400, "Tweet cannot be empty!");
  }

  const fetchedTweet = await Tweet.findById(tweetId);

  if(!fetchedTweet){
    throw new ApiError(404, "Cannot find tweet.");
  }

  if(!fetchedTweet.owner.equals(req.user._id)){
    throw new ApiErrror(403, "You are not authorized to perform this action.");
  }

  fetchedTweet.content = content;
  await fetchedTweet.save();

  return res
  .status(200)
  .json(new ApiResponse(200, "Tweet updated." , fetchedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const {tweetId} = req.params;

  const fetchedTweet = await Tweet.findById(tweetId);

  if(!fetchedTweet){
    throw new ApiError(400, "No such tweet exists!!!");
  }

  if (!fetchedTweet.owner.equals(req.user._id)) {
    throw new ApiErrror(403, "You are not authorized to perform this action.");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
  .status(200)
  .json(new ApiResponse(200, "Tweet deleted.", null));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };