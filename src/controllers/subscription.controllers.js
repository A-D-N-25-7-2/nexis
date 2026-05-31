import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id not valid!!");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found!!");
  }

  const alreadySubscribed = await Subscription.findOne({
    subscriber: new mongoose.Types.ObjectId(req.user._id),
    channel: new mongoose.Types.ObjectId(channelId),
  });

  if (alreadySubscribed) {
    await Subscription.findByIdAndDelete(alreadySubscribed._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed channel!", null));
  }

  const subscribe = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Subscribed channel!", subscribe));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

  const channel = await User.findById(req.user._id);

  if (!channel) {
    throw new ApiError(404, "Channel not found!!");
  }

  const pipeline = [];

  pipeline.push({
    $match: {
      channel: new mongoose.Types.ObjectId(channel._id),
    },
  });

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "subscriber",
      foreignField: "_id",
      as: "userDetails",
    },
  });

  pipeline.push({
    $unwind: "$userDetails",
  });

  pipeline.push({
    $project: {
      _id: 1,
      username: "$userDetails.username",
      avatar: "$userDetails.avatar",
    },
  });

  const subscribers = await Subscription.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, "Subscribers fetched!!", subscribers));

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

  const subscriber = await User.findById(req.user._id);

  if (!subscriber) {
    throw new ApiError(404, "User not found!!");
  }

  const pipeline = [];

  pipeline.push({
    $match: {
      subscriber: new mongoose.Types.ObjectId(subscriber._id),
    },
  });

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "channel",
      foreignField: "_id",
      as: "userDetails",
    },
  });

  pipeline.push({
    $unwind: "$userDetails",
  });

  pipeline.push({
    $project: {
      _id: 1,
      username: "$userDetails.username",
      avatar: "$userDetails.avatar",
    },
  });

  const channels = await Subscription.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, "Channels fetched!!", channels));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
