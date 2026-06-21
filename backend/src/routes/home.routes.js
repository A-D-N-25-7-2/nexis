import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getHomeFeed } from "../controllers/home.controllers.js";

const router = Router();

router.route("/").get(verifyJWT, getHomeFeed);
// drop verifyJWT above if you want home feed visible to logged-out users too

export default router;
