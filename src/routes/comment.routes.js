import { Router } from "express";
import { getVideoComments, addComment, 
    updateComment, deleteComment } from "../controllers/comment.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/get-all-comments/:videoId").get(getVideoComments);
router.route("/add/:videoId").post(verifyJWT, addComment);
router.route("/update/:commentId").patch(verifyJWT,updateComment);
router.route("/delete/:commentId").delete(verifyJWT, deleteComment);

export default router;