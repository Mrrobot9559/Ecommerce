const express = require("express");
const userHandler = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { registerUserSchema, loginUserSchema, refreshTokenSchema, changePasswordSchema } = require("../validation/user.validation");

const router = express.Router();

router.post("/user/register", validate(registerUserSchema), userHandler.registerUser);
router.post("/user/login", validate(loginUserSchema), userHandler.loginUser);
router.post("/user/refresh", validate(refreshTokenSchema), userHandler.refreshAccessToken);
router.post("/user/logout", authMiddleware, userHandler.logoutUser);

module.exports = router;