import { Router } from "express";
import { publishAVideo, getVideoById, deleteVideo ,
     togglePublishStatus, updateVideoDetails, getAllVideos} from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/publish").post(verifyJWT,
    upload.fields([
        { name: "video", maxCount: 1},
        { name: "thumbnail" , maxCount: 1}
    ]),
    publishAVideo);
router.route("/get-all-videos").get(verifyJWT, getAllVideos);
router.route("/:videoId").get(getVideoById);
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);
router.route("/toggle-publish-status/:videoId").patch(verifyJWT, togglePublishStatus);
router
  .route("/update-video-details/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideoDetails);

export default router;