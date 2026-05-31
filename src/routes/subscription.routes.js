import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);
router.route("/toggle/:channelId").post(toggleSubscription);
router.route("/get-subscribers").get(getUserChannelSubscribers);
router.route("/get-subscribed-channels").get(getSubscribedChannels);

export default router;