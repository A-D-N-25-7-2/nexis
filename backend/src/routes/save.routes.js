import { Router } from "express";
import {
  toggleSave,
  getSavedVideos,
} from "../controllers/save.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);
router.route("/toggle/:videoId").post(toggleSave);
router.route("/get-saved-videos").get(getSavedVideos);

export default router;
