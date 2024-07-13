import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  changePassword,
  getCurrentUser,
  getProfiledetails,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateProfile,
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/changePassword").post(verifyJWT, changePassword);
router.route("/updateProfile").patch(verifyJWT, updateProfile);
router.route("/c/:username").get(getProfiledetails)

router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/change-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
export default router;
