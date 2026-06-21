import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const NON_TWEET_LIMIT = 12;
const TWEET_LIMIT = 1;

const getHomeFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const query = req.query.query || "";
  const userId = req.user?._id;

  const searchMatch = query
    ? { $or: [{ title: { $regex: query, $options: "i" } }] }
    : {};

  const nonTweetSkip = (page - 1) * NON_TWEET_LIMIT;

  // ---- POOL A: videos + playlists, paginated together ----
  const poolAPipeline = [
    { $match: { isPublished: true, ...searchMatch } },
    { $addFields: { type: "video", sortDate: "$createdAt" } },
    {
      $unionWith: {
        coll: "playlists",
        pipeline: [
          {
            $match: {
              $expr: { $gt: [{ $size: { $ifNull: ["$videos", []] } }, 0] },
            },
          },
          { $addFields: { type: "playlist", sortDate: "$createdAt" } },
          {
            $lookup: {
              from: "videos",
              localField: "videos",
              foreignField: "_id",
              as: "videoDocs",
              pipeline: [{ $project: { thumbnail: 1 } }],
            },
          },
          {
            $addFields: {
              totalVideos: { $size: "$videos" },
              thumbnail: { $first: "$videoDocs.thumbnail" },
            },
          },
          { $project: { videoDocs: 0 } },
        ],
      },
    },
    { $sort: { sortDate: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: nonTweetSkip },
          { $limit: NON_TWEET_LIMIT },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
            },
          },
          { $unwind: "$owner" },
        ],
      },
    },
  ];

  // ---- POOL B: tweets, RANDOMLY sampled, capped to 2 per page ----
  const poolBPipeline = [
    { $sample: { size: TWEET_LIMIT } },
    { $addFields: { type: "tweet", sortDate: "$createdAt" } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
        pipeline: [
          {
            $match: { isLiked: true },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLiked: userId
          ? {
              $in: [new mongoose.Types.ObjectId(userId), "$likes.likedBy"],
            }
          : false,
      },
    },
    { $project: { likes: 0 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
      },
    },
    { $unwind: "$owner" },
  ];

  const [poolAResult, poolBResult] = await Promise.all([
    Video.aggregate(poolAPipeline),
    Tweet.aggregate(poolBPipeline),
  ]);

  const shuffleArr = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const nonTweetItems = shuffleArr(poolAResult[0]?.data || []);
  const nonTweetTotal = poolAResult[0]?.metadata[0]?.total || 0;

  const tweetItems = poolBResult; // $sample returns the array directly, no $facet wrapper

  // ---- interleave: spread tweets evenly through the non-tweet block ----
  const docs = [];
  if (tweetItems.length === 0) {
    docs.push(...nonTweetItems);
  } else {
    const gap = Math.max(
      1,
      Math.ceil(nonTweetItems.length / (tweetItems.length + 1))
    );
    let ni = 0;
    let ti = 0;

    // always open on a non-tweet chunk
    docs.push(...nonTweetItems.slice(ni, ni + gap));
    ni += gap;

    while (ti < tweetItems.length) {
      docs.push(tweetItems[ti++]);
      docs.push(...nonTweetItems.slice(ni, ni + gap));
      ni += gap;
    }

    // push any leftover non-tweet items
    if (ni < nonTweetItems.length) {
      docs.push(...nonTweetItems.slice(ni));
    }
  }

  const hasNextPage = nonTweetSkip + NON_TWEET_LIMIT < nonTweetTotal;

  const result = {
    docs,
    totalDocs: nonTweetTotal,
    limit: NON_TWEET_LIMIT,
    page,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Home feed fetched successfully"));
});

export { getHomeFeed };
