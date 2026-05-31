import { Router } from "express";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();

router.use(verifyJWT);
router.route("/tweet-toggle/:tweetId").post(toggleTweetLike);
router.route("/video-toggle/:videoId").post(toggleVideoLike);
router.route("/comment-toggle/:commentId").post( toggleCommentLike);
router.route("/get-liked-videos").get(getLikedVideos);

export default router;