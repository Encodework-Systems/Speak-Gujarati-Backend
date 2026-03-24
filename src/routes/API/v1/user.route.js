const express = require("express");
const router = express.Router();
const awaitHandlerFactory = require("../../../middleware/awaitHandlerFactory.middleware");
const auth = require("../../../middleware/auth.middleware");
const path = require("path");
const currentDirPath = __dirname;
const versionFolderName = path.basename(currentDirPath);

// For File upload
const multer = require("multer");

// Manage controller
const userController = require("../../../controllers/API/" +
  versionFolderName +
  "/user.controller");

// Manage validation
const userValidator = require("../../../validators/API/" +
  versionFolderName +
  "/user.validator");

router.post(
  "/register",
  userValidator.register,
  awaitHandlerFactory(userController.register)
);
router.post(
  "/login",
  userValidator.login,
  awaitHandlerFactory(userController.login)
);

router.post(
  "/forgot-password",
  userValidator.forgotPassword,
  awaitHandlerFactory(userController.forgetPassword)
);

router.post(
  "/change-password",
  auth(1),
  userValidator.changePassword,
  awaitHandlerFactory(userController.changePassword)
);

router.get("/profile", auth(1), awaitHandlerFactory(userController.profile));
router.post(
  "/update-profile",
  auth(1),
  awaitHandlerFactory(userController.updateProfile)
);

router.post("/logout", auth(1), awaitHandlerFactory(userController.logout));
router.delete("/delete-account", auth(1), awaitHandlerFactory(userController.delete));
router.post("/google-login", awaitHandlerFactory(userController.googleLogin));
router.post(
  "/facebook-login",
  awaitHandlerFactory(userController.facebookLogin)
);

router.get("/get-zip-md5", awaitHandlerFactory(userController.getZipMD5));
router.get("/get-zip-phrase", awaitHandlerFactory(userController.getZipPhrase));
router.get(
  "/get-word-of-the-day",
  awaitHandlerFactory(userController.getWordOfTheDay)
);
router.post(
  "/update-user-token",
  auth(1),
  awaitHandlerFactory(userController.updateUserToken)
);

router.post(
  "/save-subscription-info",
  auth(1),
  awaitHandlerFactory(userController.saveSubscriptionInfo)
);
router.get("/get-topics",auth(1), awaitHandlerFactory(userController.getAllTopics));
router.get("/get-phrases",auth(1), awaitHandlerFactory(userController.getPhrases));

module.exports = router;
