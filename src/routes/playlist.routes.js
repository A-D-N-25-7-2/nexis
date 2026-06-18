import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create").post(verifyJWT, createPlaylist);
router.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylist);
router.route("/add-video/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove-video/:playlistId/:videoId").patch(verifyJWT, removeVideoFromPlaylist);
router.route("/get-playlist/:playlistId").get(verifyJWT,getPlaylistById);
router.route("/get-user-playlists/:userId").get(verifyJWT,getUserPlaylists);

export default router;