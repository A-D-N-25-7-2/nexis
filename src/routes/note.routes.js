import { Router } from "express";
import { getNotes } from "../controllers/note.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);
router.route("/get-notes/:videoId").get(getNotes);

export default router;