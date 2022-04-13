const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/user.controller");
const {avatar} = require('../controllers/user.controller')

router.get("/users/me", auth, userController.getUserProfile);
router.get("/users/:id/avatar", userController.getUserAvatar);

router.post("/users", userController.signUp);
router.post("/users/login", userController.signIn);
router.post("/users/logout", auth, userController.logout);
router.post("/users/logoutAll", auth, userController.logoutFromAllDevices);
router.post("/users/me/avatar", auth, avatar.single("avatar"),
userController.uploadUserAvatar,
userController.handleUploadError);

router.patch("/users/me", auth, userController.updateUser);

router.delete("/users/me/avatar", auth, userController.deleteUserAvatar);
router.delete("/users/me", auth, userController.deleteUser);

module.exports = router;
