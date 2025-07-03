import {Router} from "express";

const router: Router = Router();
import * as controller from "../controllers/user.controller";
import {authToken} from "../../../middlewares/auth.middleware";

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", authToken, controller.logout);
router.get("/profile", authToken, controller.profile);
router.post("/password/forgot", controller.forgotPassword);
router.post("/password/otp", controller.otpPassword);
router.patch("/password/reset", authToken, controller.resetPassword);

export const usersRoute = router
