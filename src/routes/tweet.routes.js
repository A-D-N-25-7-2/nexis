import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create").post(verifyJWT, createTweet);
router.route("/get/:userId").get(getUserTweets);
router.route("/update/:tweetId").patch(verifyJWT, updateTweet);
router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);

export default router;